import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import logger from '@/logger';
import { Op } from 'sequelize';
import { MaximosDiasAdelanteReserva } from './model';
import { EditMaximosDiasAdelanteReservaDto } from './types';

export class MaximosDiasAdelanteReservaService {
  async findAll() {
    return MaximosDiasAdelanteReserva.findOne({
      where: { deleted_at: { [Op.is]: null } },
    });
  }

  async patch(data: EditMaximosDiasAdelanteReservaDto) {
    const transaction = await sequelize.transaction();
    try {
      const current = await MaximosDiasAdelanteReserva.findOne({
        where: { deleted_at: { [Op.is]: null } },
        transaction,
      });

      if (current) {
        logger.info('Deleting current maximos dias adelante reserva');
        await current.destroy({ transaction });
      }

      const entity = await MaximosDiasAdelanteReserva.create(data, {
        transaction,
      });

      await transaction.commit();

      auditEmitter.emitEntry({
        valor: entity.toJSON(),
        tipoEvento: 'maximos-dias-adelante-reserva:update',
      });

      return entity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export const maximosDiasAdelanteReservaService =
  new MaximosDiasAdelanteReservaService();
