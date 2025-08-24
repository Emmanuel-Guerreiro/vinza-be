import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { Recorrido } from './model';
import { User } from '@/users/model';
import { CreateRecorridoDto, UpdateRecorridoDto } from './types';
//import { CreatedAt, UpdatedAt } from "sequelize-typescript";

class RecorridoService {
  public async create(dto: CreateRecorridoDto) {
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(dto.userId);
      if (!user) throw errors.app.user.not_found;

      const recorrido = await Recorrido.create(dto, { transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:create',
        valor: recorrido.dataValues,
      });
      await transaction.commit();
      return recorrido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async update(id: number, dto: UpdateRecorridoDto) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await Recorrido.findByPk(id);
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

  public async findAll() {
    const transaction = await sequelize.transaction();
    try {
      const recorridos = await Recorrido.findAll({
        where: { deleted_at: null },
        transaction,
      });
      return recorridos;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async findById(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await Recorrido.findByPk(id, { transaction });
      if (!recorrido) throw errors.app.recorrido.not_found;
      return recorrido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  public async delete(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await Recorrido.findByPk(id, { transaction });
      if (!recorrido) throw errors.app.recorrido.not_found;
      await recorrido.destroy({ transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:delete',
        valor: recorrido.dataValues,
      });

      await transaction.commit();
      return recorrido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
export const recorridoService = new RecorridoService();
export type IRecorridoService = typeof recorridoService;
