import { Transaction } from 'sequelize';
import { EstadoReserva } from './model';
import { CreateEstadoReservaDto, UpdateEstadoReservaDto } from './types';
import { errors } from '@/error';

class EstadoReservaService {
  public async create(dto: CreateEstadoReservaDto) {
    const estadoReserva = await EstadoReserva.create(dto);
    return estadoReserva;
  }

  public findAll() {
    return EstadoReserva.findAll();
  }

  public async findOne(id: number, transaction?: Transaction) {
    const estadoReserva = await EstadoReserva.findByPk(id, { transaction });
        if (!estadoReserva) throw errors.app.reserva.estado_not_found;
    return estadoReserva;
  }

  public async update(id: number, dto: UpdateEstadoReservaDto) {
    const estadoReserva = await EstadoReserva.findByPk(id);
    if (!estadoReserva) throw errors.app.reserva.estado_not_found;
    const updatedEstadoReserva = await estadoReserva.update(dto, {
      returning: true,
    });
    return updatedEstadoReserva;
  }

  public async delete(id: number) {
    const estadoReserva = await EstadoReserva.findByPk(id);
        if (!estadoReserva) throw errors.app.reserva.estado_not_found;
    await estadoReserva.destroy();
    return estadoReserva;
  }
}

export const estadoReservaService = new EstadoReservaService();
export type IEstadoReservaService = typeof estadoReservaService;