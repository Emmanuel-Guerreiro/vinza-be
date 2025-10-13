import { errors } from '@/error';
import { Transaction } from 'sequelize';
import { EstadoReserva } from './model';
import { CreateEstadoReservaDto, UpdateEstadoReservaDto } from './types';
import { PaginationParams } from '@/pagination/schemas';
import { generatePaginationParams } from '@/pagination';
import { HEstadoReserva } from './model';
import { auditEmitter } from '@/audit/event';

class EstadoReservaService {
  public async create(dto: CreateEstadoReservaDto) {
    const estadoReserva = await EstadoReserva.create(dto);
    auditEmitter.emitEntry({
      tipoEvento: 'estado-reserva:create',
      valor: estadoReserva.dataValues,
    });
    return estadoReserva;
  }

  public async findAll(params: PaginationParams) {
    const { limit, offset } = generatePaginationParams(params);
    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(params, limit),
      EstadoReserva.findAll({
        limit,
        offset,
      }),
    ]);

    return {
      items,
      meta,
    };
  }

  public async findOne(id: number, transaction?: Transaction) {
    return EstadoReserva.findByPk(id, { transaction });
  }

  public async findByName(nombre: string, transaction?: Transaction) {
    return EstadoReserva.findOne({ where: { nombre }, transaction });
  }

  public async update(id: number, dto: UpdateEstadoReservaDto) {
    const estadoReserva = await EstadoReserva.findByPk(id);
    if (!estadoReserva) throw errors.app.reserva.estado_not_found;
    const updatedEstadoReserva = await estadoReserva.update(dto, {
      returning: true,
    });
    auditEmitter.emitEntry({
      tipoEvento: 'estado-reserva:update',
      valor: updatedEstadoReserva.dataValues,
    });
    return updatedEstadoReserva;
  }

  public async delete(id: number) {
    const estadoReserva = await EstadoReserva.findByPk(id);
    if (!estadoReserva) throw errors.app.reserva.estado_not_found;
    await estadoReserva.destroy();
    auditEmitter.emitEntry({
      tipoEvento: 'estado-reserva:delete',
      valor: estadoReserva.dataValues,
    });
    return estadoReserva;
  }

  public async canDelete(id: number) {
    const estadoReserva = await EstadoReserva.findByPk(id);
    if (!estadoReserva) throw errors.app.reserva.estado_not_found;

    const reservasWithEstado = await HEstadoReserva.count({
      where: { estadoReservaId: id },
    });

    return reservasWithEstado === 0;
  }

  private async getCountAndMetadata(params: PaginationParams, limit: number) {
    const totalItems = await EstadoReserva.count();
    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: params.page || 1,
      itemsPerPage: limit,
    };
  }
}

export const estadoReservaService = new EstadoReservaService();
export type IEstadoReservaService = typeof estadoReservaService;
