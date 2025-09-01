import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { Recorrido } from './model';
import { CreateRecorridoDto, UpdateRecorridoDto } from './types';
import { usersService } from '@/users/service';
import { Transaction } from 'sequelize';

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

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:create',
        valor: recorrido.dataValues,
      });
      if (!t) await transaction.commit();
      return recorrido;
    } catch (error) {
      if (!t) await transaction.rollback();
      throw error;
    }
  }
  //tiene un update? sobre la optimizacion? o eso es aparte?
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

  public async findAll() {
    const recorridos = await Recorrido.findAll();
    return recorridos;
  }

  public async findById(id: number, transaction?: Transaction) {
    return Recorrido.findByPk(id, { transaction });
  }
  public async delete(id: number) {
    const recorrido = await this.findById(id);
    if (!recorrido) throw errors.app.recorrido.not_found;
    await recorrido.destroy();

    auditEmitter.emitEntry({
      tipoEvento: 'recorrido:delete',
      valor: recorrido.dataValues,
    });

    return recorrido;
  }
}
export const recorridoService = new RecorridoService();
export type IRecorridoService = typeof recorridoService;
