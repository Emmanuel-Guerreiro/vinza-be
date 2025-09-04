import { Transaction } from 'sequelize';
import { EstadoEvento } from './model';
import { CreateEstadoEventoDto, UpdateEstadoEventoDto } from './types';
import { errors } from '@/error';

class EstadoEventoService {
  public async create(dto: CreateEstadoEventoDto) {
    const estadoEvento = await EstadoEvento.create(dto);
    return estadoEvento;
  }

  public findAll() {
    return EstadoEvento.findAll();
  }

  public async findOne(id: number, transaction?: Transaction) {
    const estadoEvento = await EstadoEvento.findByPk(id, { transaction });
    if (!estadoEvento) throw errors.app.evento.estado_not_found;
    return estadoEvento;
  }

  public async findByName(nombre: string, transaction?: Transaction) {
    const estadoEvento = await EstadoEvento.findOne({
      where: { nombre },
      transaction,
    });
    return estadoEvento;
  }

  public async update(id: number, dto: UpdateEstadoEventoDto) {
    const estadoEvento = await EstadoEvento.findByPk(id);
    if (!estadoEvento) throw errors.app.evento.estado_not_found;
    const updatedEstadoEvento = await estadoEvento.update(dto, {
      returning: true,
    });
    return updatedEstadoEvento;
  }

  public async delete(id: number) {
    const estadoEvento = await EstadoEvento.findByPk(id);
    if (!estadoEvento) throw errors.app.evento.estado_not_found;
    await estadoEvento.destroy();
    return estadoEvento;
  }
}

export const estadoEventoService = new EstadoEventoService();
export type IEstadoEventoService = typeof estadoEventoService;
