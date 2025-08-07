import { RecurrenciaEvento } from './model';
import { CreateRecurrenciaEventoDto, UpdateRecurrenciaEventoDto } from './types';
import { errors } from '@/error';

export class RecurrenciaEventoService {
  async create(data: CreateRecurrenciaEventoDto): Promise<RecurrenciaEvento> {
    try {
      return await RecurrenciaEvento.create(data);
    } catch (error) {
      throw errors.app.recurrenciaEvento.create_error;
    }
  }

  async findAll(eventoId?: number): Promise<RecurrenciaEvento[]> {
    try {
      const where: any = {};
      if (eventoId) {
        where.eventoId = eventoId;
      }
      
      return await RecurrenciaEvento.findAll({
        where,
        include: ['evento'],
      });
    } catch (error) {
      throw errors.app.recurrenciaEvento.find_all_error;
    }
  }

  async findById(id: number): Promise<RecurrenciaEvento | null> {
    try {
      return await RecurrenciaEvento.findByPk(id, {
        include: ['evento'],
      });
    } catch (error) {
      throw errors.app.recurrenciaEvento.find_by_id_error;
    }
  }

  async update(id: number, data: UpdateRecurrenciaEventoDto): Promise<RecurrenciaEvento | null> {
    try {
      const recurrencia = await RecurrenciaEvento.findByPk(id);
      if (!recurrencia) {
        throw errors.app.recurrenciaEvento.not_found;
      }

      await recurrencia.update(data);
      return recurrencia;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not_found')) {
        throw error;
      }
      throw errors.app.recurrenciaEvento.update_error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const recurrencia = await RecurrenciaEvento.findByPk(id);
      if (!recurrencia) {
        throw errors.app.recurrenciaEvento.not_found;
      }

      await recurrencia.destroy();
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not_found')) {
        throw error;
      }
      throw errors.app.recurrenciaEvento.delete_error;
    }
  }

  async createMany(recurrencias: CreateRecurrenciaEventoDto[]): Promise<RecurrenciaEvento[]> {
    try {
      return await RecurrenciaEvento.bulkCreate(recurrencias);
    } catch (error) {
      throw errors.app.recurrenciaEvento.create_many_error;
    }
  }
}

