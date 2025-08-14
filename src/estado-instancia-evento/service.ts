import { Transaction } from 'sequelize';
import { EstadoInstanciaEvento } from './model';
import {
  CreateEstadoInstanciaEventoDto,
  UpdateEstadoInstanciaEventoDto,
} from './types';
import { errors } from '@/error';

class EstadoInstanciaEventoService {
  public async create(dto: CreateEstadoInstanciaEventoDto) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.create(dto);
    return estadoInstanciaEvento;
  }

  public findAll() {
    return EstadoInstanciaEvento.findAll();
  }

  public async findOne(id: number, transaction?: Transaction) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.findByPk(id, {
      transaction,
    });
    if (!estadoInstanciaEvento)
      throw errors.app.instancia_evento.estado_not_found;
    return estadoInstanciaEvento;
  }

  public async update(id: number, dto: UpdateEstadoInstanciaEventoDto) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.findByPk(id);
    if (!estadoInstanciaEvento)
      throw errors.app.instancia_evento.estado_not_found;
    const updatedEstadoInstanciaEvento = await estadoInstanciaEvento.update(
      dto,
      {
        returning: true,
      },
    );
    return updatedEstadoInstanciaEvento;
  }

  public async delete(id: number) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.findByPk(id);
    if (!estadoInstanciaEvento)
      throw errors.app.instancia_evento.estado_not_found;
    await estadoInstanciaEvento.destroy();
    return estadoInstanciaEvento;
  }
}

export const estadoInstanciaEventoService = new EstadoInstanciaEventoService();
export type IEstadoInstanciaEventoService = typeof estadoInstanciaEventoService;
