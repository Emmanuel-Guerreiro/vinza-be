import { RecurrenciaEvento } from './model';
import {
  CreateRecurrenciaEventoDto,
  UpdateRecurrenciaEventoDto,
} from './types';
import { errors } from '@/error';

export class RecurrenciaEventoService {
  async create(data: CreateRecurrenciaEventoDto): Promise<RecurrenciaEvento> {
    try {
      return await RecurrenciaEvento.create(data);
    } catch {
      throw errors.app.recurrencia_evento.create_error;
    }
  }

  async findAll(eventoId?: number): Promise<RecurrenciaEvento[]> {
    try {
      const where: { eventoId?: number } = {};
      if (eventoId) {
        where.eventoId = eventoId;
      }

      return await RecurrenciaEvento.findAll({
        where,
        include: ['evento'],
      });
    } catch {
      throw errors.app.recurrencia_evento.find_all_error;
    }
  }

  async findById(id: number): Promise<RecurrenciaEvento | null> {
    try {
      const recurrencia = await RecurrenciaEvento.findByPk(id, {
        include: ['evento'],
      });

      if (!recurrencia) {
        throw errors.app.recurrencia_evento.not_found;
      }

      return recurrencia;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not_found')) {
        throw error;
      }
      throw errors.app.recurrencia_evento.find_by_id_error;
    }
  }

  async update(
    id: number,
    data: UpdateRecurrenciaEventoDto,
  ): Promise<RecurrenciaEvento | null> {
    try {
      const recurrencia = await RecurrenciaEvento.findByPk(id);
      if (!recurrencia) {
        throw errors.app.recurrencia_evento.not_found;
      }

      await recurrencia.update(data);
      return recurrencia;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not_found')) {
        throw error;
      }
      throw errors.app.recurrencia_evento.update_error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const recurrencia = await RecurrenciaEvento.findByPk(id);
      if (!recurrencia) {
        throw errors.app.recurrencia_evento.not_found;
      }

      await recurrencia.destroy();
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not_found')) {
        throw error;
      }
      throw errors.app.recurrencia_evento.delete_error;
    }
  }

  async createMany(
    recurrencias: CreateRecurrenciaEventoDto[],
  ): Promise<RecurrenciaEvento[]> {
    try {
      return await RecurrenciaEvento.bulkCreate(recurrencias);
    } catch {
      throw errors.app.recurrencia_evento.create_many_error;
    }
  }
}

export const recurrenciaEventoService = new RecurrenciaEventoService();
export type IRecurrenciaEventoService = typeof recurrenciaEventoService;
