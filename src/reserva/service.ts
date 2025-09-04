import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { EstadoReservaEnum } from '@/estado-reserva/enum';
import { EstadoReserva } from '@/estado-reserva/model';
import { estadoReservaService } from '@/estado-reserva/service';
import { Evento } from '@/evento/model';
import { eventoService } from '@/evento/service';
import { InstanciaEvento } from '@/instancia-evento/model';
import { Recorrido } from '@/recorrido/model';
import { recorridoService } from '@/recorrido/service';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Reserva } from './model';
import {
  CreateReservaDto,
  ReservaFilterParams,
  UpdateReservaDto,
} from './types';
import {
  generateOrderConditions,
  generatePaginationParams,
} from '@/pagination';
import logger from '@/logger';

class ReservaService {
  public async create(dto: CreateReservaDto) {
    const transaction = await sequelize.transaction();
    try {
      const evento = await eventoService.findByInstanciaEvento(
        dto.instanciaEventoId,
        transaction,
      );
      if (!evento) {
        throw errors.app.evento.not_found;
      }

      const reservasConfirmadas =
        await reservaService.countConfirmadasByInstancia(
          dto.instanciaEventoId,
          transaction,
        );

      if (dto.cantidadGente > evento.cupo - reservasConfirmadas) {
        throw errors.app.reserva.cupos_not_enough;
      }

      // Find or create recorrido
      let recorrido: Recorrido | null = null;
      if (dto.recorridoId) {
        recorrido = await recorridoService.findById(
          dto.recorridoId,
          transaction,
        );
        // Non valid recorridoId case
        if (!recorrido) {
          throw errors.app.recorrido.not_found;
        }
      } else {
        recorrido = await recorridoService.create(
          { userId: dto.userId },
          transaction,
        );
      }

      const reserva = await Reserva.create(
        {
          cantidadGente: dto.cantidadGente,
          instanciaEventoId: dto.instanciaEventoId,
          recorridoId: recorrido.id,
          precio: evento.precio,
        },
        { transaction },
      );

      const initialEstadoReserva = await estadoReservaService.findByName(
        EstadoReservaEnum.PENDIENTE,
        transaction,
      );
      if (!initialEstadoReserva) {
        throw errors.app.estadoReserva.estado_not_found;
      }
      await reserva.$set('estados', [initialEstadoReserva.id], {
        transaction,
      });
      await reserva.reload({ transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'reserva:create',
        valor: reserva.dataValues,
      });

      await transaction.commit();

      return reserva;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error creating reserva -> ${JSON.stringify(error)}`);
      throw errors.app.reserva.create_error;
    }
  }

  public async confirmarReserva(id: number, t?: Transaction) {
    const transaction = t || (await sequelize.transaction());
    try {
      const reserva = await this.findOne(id, transaction);
      if (!reserva) throw errors.app.reserva.not_found;

      if (reserva.estados?.[0].nombre !== EstadoReservaEnum.PENDIENTE) {
        // No se puede confirmar una reserva que no está pendiente
        throw errors.app.reserva.invalid_state;
      }

      const evento = await eventoService.findByInstanciaEvento(
        reserva.instanciaEventoId,
        transaction,
      );
      if (!evento) throw errors.app.evento.not_found;

      const reservasConfirmadas =
        await reservaService.countConfirmadasByInstancia(
          reserva.instanciaEventoId,
          transaction,
        );

      if (reserva.cantidadGente > evento.cupo - reservasConfirmadas) {
        throw errors.app.reserva.cupos_not_enough;
      }

      const reservaEstadoConfirmada = await estadoReservaService.findByName(
        EstadoReservaEnum.CONFIRMADA,
        transaction,
      );
      if (!reservaEstadoConfirmada) {
        throw errors.app.estadoReserva.estado_not_found;
      }

      await reserva.$set('estados', [reservaEstadoConfirmada.id], {
        transaction,
      });

      auditEmitter.emitEntry({
        tipoEvento: 'reserva:update',
        valor: reserva.dataValues,
      });

      if (!t) await transaction.commit();
      return reserva;
    } catch (error) {
      logger.error(`Error confirming reserva -> ${JSON.stringify(error)}`);
      if (!t) await transaction.rollback();
      throw error;
    }
  }

  public async update(id: number, dto: UpdateReservaDto) {
    const transaction = await sequelize.transaction();
    try {
      const reserva = await this.findOne(id, transaction);

      if (!reserva) throw errors.app.reserva.not_found;
      if (reserva.estados?.[0].nombre !== EstadoReservaEnum.PENDIENTE) {
        // No se puede actualizar una reserva que no está pendiente
        throw errors.app.reserva.invalid_state;
      }
      await reserva.update(dto, { transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'reserva:update',
        valor: reserva.dataValues,
      });

      await transaction.commit();
      return reserva;
    } catch {
      await transaction.rollback();
      throw errors.app.reserva.update_error;
    }
  }

  public async delete(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const reserva = await this.findOne(id, transaction);
      if (!reserva) throw errors.app.reserva.not_found;
      if (reserva.estados?.[0].nombre === EstadoReservaEnum.CANCELADA) {
        // No se puede eliminar una reserva que ya está cancelada
        throw errors.app.reserva.invalid_state;
      }

      const estadoReserva = await estadoReservaService.findByName(
        EstadoReservaEnum.CANCELADA,
        transaction,
      );
      if (!estadoReserva) throw errors.app.estadoReserva.estado_not_found;

      // The cancel status is only to make the state machine history consistent
      // But for ease of use, we will not actually delete the reservation
      await reserva.$set('estados', [estadoReserva.id], { transaction });
      await reserva.destroy({ transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'reserva:delete',
        valor: reserva.dataValues,
      });

      await transaction.commit();
      return reserva;
    } catch (error) {
      await transaction.rollback();
      logger.error(JSON.stringify(error));
      throw error;
    }
  }

  public async findAll(filter: ReservaFilterParams) {
    const where = this.generateWhereConditions(filter);
    const order = generateOrderConditions(filter);
    const { limit, offset } = generatePaginationParams(filter);

    return Reserva.findAll({
      include: [
        {
          model: EstadoReserva,
          as: 'estados',
        },
        {
          model: InstanciaEvento,
          as: 'instanciaEvento',
          include: [
            {
              model: Evento,
              as: 'evento',
            },
          ],
        },
      ],
      where,
      order,
      limit,
      offset,
    });
  }

  public async findOne(id: number, transaction?: Transaction) {
    return Reserva.findByPk(id, {
      transaction,
      include: [
        {
          model: EstadoReserva,
          as: 'estados',
        },
        {
          model: InstanciaEvento,
          as: 'instanciaEvento',
          include: [
            {
              model: Evento,
              as: 'evento',
            },
          ],
        },
      ],
    });
  }

  public async findAllByEventoId(eventoId: number) {
    return Reserva.findAll({
      where: { instanciaEventoId: eventoId },
      include: [
        {
          model: Evento,
          as: 'instanciaEvento',
          attributes: ['idEvento', 'nombre', 'cupo'],
        },
      ],
    });
  }

  public async findAllByRecorridoId(recorridoId: number) {
    return Reserva.findAll({
      where: { recorridoId: recorridoId },
      include: [
        {
          model: Recorrido,
          as: 'recorrido',
          attributes: ['idRecorrido', 'idUser'],
        },
      ],
    });
  }

  public async countConfirmadasByInstancia(
    instanciaEventoId: number,
    transaction?: Transaction,
  ) {
    return Reserva.count({
      transaction,
      include: [
        {
          model: InstanciaEvento,
          as: 'instanciaEvento',
          where: { id: instanciaEventoId },
          attributes: ['id'],
          required: true,
        },
        {
          model: EstadoReserva,
          as: 'estados',
          required: true,
          where: { nombre: EstadoReservaEnum.CONFIRMADA },
          attributes: ['id'],
        },
      ],
      distinct: true,
    });
  }

  private generateWhereConditions(filter: ReservaFilterParams) {
    const where: WhereOptions = {};
    if (filter.estado) {
      where.estados = {
        [Op.in]: [filter.estado],
      };
    }
    return where;
  }
}

export const reservaService = new ReservaService();
export type IReservaService = typeof reservaService;
