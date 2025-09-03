import { Transaction } from 'sequelize';
import { EstadoRecorrido } from './model';
import { CreateEstadoRecorridoDto, UpdateEstadoRecorridoDto } from './types';
import { errors } from '@/error';
import { EstadoRecorridoEnum } from './enum';

class EstadoRecorridoService {
  public async create(dto: CreateEstadoRecorridoDto) {
    const estadoRecorrido = await EstadoRecorrido.create(dto);
    return estadoRecorrido;
  }

  public findAll() {
    return EstadoRecorrido.findAll();
  }

  public async findByName(
    nombre: EstadoRecorridoEnum,
    transaction?: Transaction,
  ) {
    return EstadoRecorrido.findOne({
      where: { nombre },
      transaction,
    });
  }

  public async findOne(id: number, transaction?: Transaction) {
    const estadoRecorrido = await EstadoRecorrido.findByPk(id, { transaction });
    if (!estadoRecorrido) throw errors.app.estado_recorrido.estado_not_found;

    return estadoRecorrido;
  }

  public async update(id: number, dto: UpdateEstadoRecorridoDto) {
    const estadoRecorrido = await EstadoRecorrido.findByPk(id);
    if (!estadoRecorrido) throw errors.app.estado_recorrido.estado_not_found;

    const updatedEstadoRecorrido = await estadoRecorrido.update(dto, {
      returning: true,
    });

    return updatedEstadoRecorrido;
  }

  public async delete(id: number) {
    const estadoRecorrido = await EstadoRecorrido.findByPk(id);
    if (!estadoRecorrido) throw errors.app.estado_recorrido.estado_not_found;
    await estadoRecorrido.destroy();
    return estadoRecorrido;
  }
}
export const estadoRecorridoService = new EstadoRecorridoService();
export type IEstadoRecorridoService = typeof estadoRecorridoService;
