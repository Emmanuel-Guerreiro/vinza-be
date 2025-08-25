import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { Recorrido } from './model';
import { CreateRecorridoDto, UpdateRecorridoDto } from './types';
import { usersService } from '@/users/service';

class RecorridoService {
  public async create(dto: CreateRecorridoDto) {
    const transaction = await sequelize.transaction();
    try {
      const user = await usersService.findOne(dto.userId);
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
  //tiene un update? sobre la optimizacion? o eso es aparte?
  public async update(id: number, dto: UpdateRecorridoDto) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await Recorrido.findByPk(id);
      if (!recorrido) throw errors.app.recorrido.recorrido_not_found;

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
      if (!recorrido) throw errors.app.recorrido.recorrido_not_found;
      return recorrido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  public async delete(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await recorridoService.findById(id);
      if (!recorrido) throw errors.app.recorrido.recorrido_not_found;

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
