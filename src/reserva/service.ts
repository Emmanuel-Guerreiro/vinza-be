import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { EstadoReservaEnum } from '@/estado-reserva/enum';
import { EstadoReserva } from '@/estado-reserva/model';
import { estadoReservaService } from '@/estado-reserva/service';
import { Evento } from '@/evento/model';
import { eventoService } from '@/evento/service';
import { InstanciaEvento } from '@/instancia-evento/model';
import logger from '@/logger';
import {
  generateOrderConditions,
  generatePaginationParams,
} from '@/pagination';
import { PaginatedResponse } from '@/pagination/types';
import { Recorrido } from '@/recorrido/model';
import { recorridoService } from '@/recorrido/service';
import { Sucursal } from '@/sucursal/model';
import { User } from '@/users/model';
import { FindOptions, Op, Transaction, WhereOptions } from 'sequelize';
import { Reserva } from './model';
import {
  CreateReservaDto,
  ReservaFilterParams,
  UpdateReservaDto,
} from './types';

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

        // Cant add the same instancia to the same recorrido twice
        if (
          recorrido.reservas
            .flatMap((reserva) => reserva.instanciaEventoId)
            .some(
              (instanciaEventoId) =>
                instanciaEventoId === dto.instanciaEventoId,
            )
        ) {
          throw errors.app.reserva.duplicated_event_for_recorrido;
        }
      } else {
        recorrido = await recorridoService.create(
          {
            userId: dto.userId,
            name: `Recorrido ${new Date().toISOString().split('T')[0]}`,
          },
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
        logger.error('Estado reserva not found en ReservaService.create');
        throw errors.app.estado_reserva.estado_not_found;
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
      throw error;
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
        logger.error('Estado reserva not found en ReservaService.confirmar');
        throw errors.app.estado_reserva.estado_not_found;
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

  public async delete(id: number, t?: Transaction) {
    const transaction = t || (await sequelize.transaction());
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
      if (!estadoReserva) {
        logger.error('Estado reserva not found en ReservaService.delete');
        throw errors.app.estado_reserva.estado_not_found;
      }

      // The cancel status is only to make the state machine history consistent
      // But for ease of use, we will not actually delete the reservation
      await reserva.$set('estados', [estadoReserva.id], { transaction });
      await reserva.destroy({ transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'reserva:delete',
        valor: reserva.dataValues,
      });

      if (!t) await transaction.commit();
      return reserva;
    } catch (error) {
      if (!t) await transaction.rollback();
      logger.error(JSON.stringify(error));
      throw error;
    }
  }

  public async findAll(
    filter: ReservaFilterParams,
    bodegaId?: number,
  ): Promise<PaginatedResponse<Reserva>> {
    const where = this.generateWhereConditions();
    const order = generateOrderConditions(filter);
    const { limit, offset } = generatePaginationParams(filter);

    // Construir filtros de fecha para InstanciaEvento
    let filtrosFecha: Record<string, unknown> | null = null;
    if (filter.fechaDesde || filter.fechaHasta) {
      filtrosFecha = {};
      if (filter.fechaDesde && filter.fechaHasta) {
        filtrosFecha.fecha = {
          [Op.between]: [filter.fechaDesde, filter.fechaHasta],
        };
      } else if (filter.fechaDesde) {
        filtrosFecha.fecha = {
          [Op.gte]: filter.fechaDesde,
        };
      } else if (filter.fechaHasta) {
        filtrosFecha.fecha = {
          [Op.lte]: filter.fechaHasta,
        };
      }
    }

    // Construir filtros de usuario para User
    let userWhere: Record<string, unknown> | null = null;
    if (filter.nombre || filter.email) {
      userWhere = {};
      if (filter.nombre) {
        userWhere.nombre = {
          [Op.iLike]: `%${filter.nombre}%`,
        };
      }
      if (filter.email) {
        userWhere.email = {
          [Op.iLike]: `%${filter.email}%`,
        };
      }
    }

    const queryOptions = {
      include: [
        {
          model: EstadoReserva,
          as: 'estados',
          where: filter.estado ? { nombre: filter.estado } : undefined,
          required: !!filter.estado,
        },
        {
          model: InstanciaEvento,
          as: 'instanciaEvento',
          where: filtrosFecha || undefined,
          include: [
            {
              model: Evento,
              as: 'evento',
              where: filter.eventoId ? { id: filter.eventoId } : undefined,
              required: !!filter.eventoId,
              include: [
                {
                  model: Sucursal,
                  as: 'sucursal',
                  where: bodegaId ? { bodegaId } : undefined,
                  required: !!bodegaId,
                  attributes: ['id', 'nombre', 'bodegaId'],
                },
              ],
            },
          ],
        },
        {
          model: Recorrido,
          as: 'recorrido',
          attributes: ['id', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              where: userWhere || undefined,
              required: !!(filter.nombre || filter.email),
              attributes: ['id', 'nombre', 'apellido', 'email'],
            },
          ],
        },
      ],
      where,
      order,
      limit,
      offset,
    };

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(queryOptions, filter.page, limit),
      Reserva.findAll(queryOptions),
    ]);

    return {
      items,
      meta,
    };
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
        {
          model: Recorrido,
          as: 'recorrido',
          attributes: ['id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'nombre', 'apellido', 'email'],
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

  /**
   * Get total count of items and generate complete pagination metadata
   */
  private async getCountAndMetadata(
    queryOptions: FindOptions,
    page: number,
    limit: number,
  ) {
    const countResult = await Reserva.count(queryOptions);
    const totalItems = Array.isArray(countResult)
      ? countResult.length
      : countResult;

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page || 1,
      itemsPerPage: limit,
    };
  }

  private generateWhereConditions() {
    const where: WhereOptions = {};
    // Los filtros de estado, nombre, email, eventoId y fechas se manejan en los includes
    return where;
  }
}

export const reservaService = new ReservaService();
export type IReservaService = typeof reservaService;
