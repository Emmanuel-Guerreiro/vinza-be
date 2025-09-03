import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { Recorrido } from './model';
import {
  CreateRecorridoDto,
  FindAllRecorridosParams,
  UpdateRecorridoDto,
} from './types';
import { usersService } from '@/users/service';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { reservaService } from '@/reserva/service';
import { Reserva } from '@/reserva/model';
import { EstadoRecorrido } from '@/estado-recorrido/model';
import { EstadoRecorridoEnum } from '@/estado-recorrido/enum';
import {
  generateOrderConditions,
  generatePaginationParams,
} from '@/pagination';
import { estadoRecorridoService } from '@/estado-recorrido/service';
import logger from '@/logger';

class RecorridoService {
  public async create(dto: CreateRecorridoDto, t?: Transaction) {
    const transaction = t || (await sequelize.transaction());
    try {
      const user = await usersService.findOne(dto.userId, transaction);
      if (!user) throw errors.app.user.not_found;

      const recorrido = await Recorrido.create(
        {
          userId: dto.userId,
        },
        { transaction },
      );

      const estadoPendiente = await estadoRecorridoService.findByName(
        EstadoRecorridoEnum.PENDIENTE,
        transaction,
      );

      if (!estadoPendiente) {
        logger.error(
          `Estado pendiente not found for recorrido ${recorrido.id}`,
        );
        throw errors.app.estado_recorrido.estado_not_found;
      }

      await recorrido.$set('estados', [estadoPendiente.id], { transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:create',
        valor: recorrido.dataValues,
      });

      const recorridoWithEstados = await this.findById(
        recorrido.id,
        transaction,
      );
      if (!recorridoWithEstados) {
        logger.error(
          `Recorrido ${recorrido.id} not found after create with estados`,
        );
        throw errors.app.recorrido.create_error;
      }
      if (!t) await transaction.commit();
      return recorridoWithEstados;
    } catch (error) {
      if (!t) await transaction.rollback();
      logger.error(JSON.stringify(error));
      throw error;
    }
  }

  public async update(id: number, dto: UpdateRecorridoDto) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await Recorrido.findByPk(id, { transaction });
      if (!recorrido) throw errors.app.recorrido.not_found;

      const updatedRecorrido = await recorrido.update(dto, {
        returning: true,
        transaction,
      });

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:update',
        valor: updatedRecorrido.dataValues,
      });

      await transaction.commit();
      return updatedRecorrido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async confirmarRecorrido(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await this.findOneWithReservas(id, transaction);

      if (
        !recorrido ||
        recorrido.estados?.[0]?.nombre == EstadoRecorridoEnum.CANCELADO
      )
        throw errors.app.recorrido.not_found;

      if (recorrido.estados?.[0]?.nombre === EstadoRecorridoEnum.CONFIRMADO) {
        throw errors.app.recorrido.already_confirmed;
      }

      if (recorrido.reservas.length === 0) {
        throw errors.app.recorrido.empty_recorrido;
      }
      await Promise.all(
        recorrido.reservas.map(async (reserva) => {
          await reservaService.confirmarReserva(reserva.id, transaction);
        }),
      );

      const estadoConfirmado = await estadoRecorridoService.findByName(
        EstadoRecorridoEnum.CONFIRMADO,
        transaction,
      );
      if (!estadoConfirmado) throw errors.app.estado_recorrido.estado_not_found;
      await recorrido?.$set('estados', [estadoConfirmado.id], { transaction });

      await transaction.commit();

      return this.findOneWithReservas(id);
    } catch (error) {
      logger.error(`Error confirming recorrido -> ${JSON.stringify(error)}`);
      await transaction.rollback();
      throw error;
    }
  }

  public async findAll(params: FindAllRecorridosParams) {
    const where = this.generateWhereConditions(params);
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);
    const recorridos = await Recorrido.findAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: EstadoRecorrido, as: 'estados' },
        { model: Reserva, as: 'reservas' },
      ],
    });
    return recorridos;
  }

  public async findById(id: number, transaction?: Transaction) {
    return Recorrido.findByPk(id, {
      include: [
        { model: EstadoRecorrido, as: 'estados' },
        { model: Reserva, as: 'reservas' },
      ],
      transaction,
    });
  }

  private async findOneWithReservas(id: number, transaction?: Transaction) {
    return Recorrido.findOne({
      where: { id },
      include: [
        { model: Reserva, as: 'reservas' },
        { model: EstadoRecorrido, as: 'estados' },
      ],
      transaction,
    });
  }

  public async delete(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await this.findById(id, transaction);
      const estadoCancelado = await estadoRecorridoService.findByName(
        EstadoRecorridoEnum.CANCELADO,
        transaction,
      );
      if (!estadoCancelado) throw errors.app.estado_recorrido.estado_not_found;
      await recorrido?.$set('estados', [estadoCancelado.id], { transaction });

      if (!recorrido) throw errors.app.recorrido.not_found;
      await recorrido.destroy({ transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:delete',
        valor: recorrido.dataValues,
      });

      await transaction.commit();

      return recorrido;
    } catch (error) {
      logger.error(`Error deleting recorrido -> ${JSON.stringify(error)}`);
      await transaction.rollback();
      throw error;
    }
  }

  private generateWhereConditions(params: FindAllRecorridosParams) {
    const where: WhereOptions<Recorrido> = {};
    if (params.userId) where.userId = params.userId;
    if (params.estados) where.estados = { nombre: { [Op.in]: params.estados } };
    return where;
  }
}
export const recorridoService = new RecorridoService();
export type IRecorridoService = typeof recorridoService;
