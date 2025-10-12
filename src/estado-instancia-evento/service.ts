import { errors } from '@/error';
import { InstanciaEvento } from '@/instancia-evento/model';
import { generatePaginationParams } from '@/pagination';
import { PaginationParams } from '@/pagination/schemas';
import { Transaction } from 'sequelize';
import { EstadoInstanciaEvento } from './model';
import {
  CreateEstadoInstanciaEventoDto,
  UpdateEstadoInstanciaEventoDto,
} from './types';
import { auditEmitter } from '@/audit/event';

class EstadoInstanciaEventoService {
  public async create(dto: CreateEstadoInstanciaEventoDto) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.create(dto);
    auditEmitter.emitEntry({
      tipoEvento: 'estado-instancia-evento:create',
      valor: estadoInstanciaEvento.dataValues,
    });
    return estadoInstanciaEvento;
  }

  public async findAll(params: PaginationParams) {
    const { limit, offset } = generatePaginationParams(params);
    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(params, limit),
      EstadoInstanciaEvento.findAll({
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
    auditEmitter.emitEntry({
      tipoEvento: 'estado-instancia-evento:update',
      valor: updatedEstadoInstanciaEvento.dataValues,
    });
    return updatedEstadoInstanciaEvento;
  }

  public async delete(id: number) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.findByPk(id);
    if (!estadoInstanciaEvento)
      throw errors.app.instancia_evento.estado_not_found;
    await estadoInstanciaEvento.destroy();
    auditEmitter.emitEntry({
      tipoEvento: 'estado-instancia-evento:delete',
      valor: estadoInstanciaEvento.dataValues,
    });
    return estadoInstanciaEvento;
  }

  public async canDelete(id: number) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.findByPk(id);
    if (!estadoInstanciaEvento)
      throw errors.app.instancia_evento.estado_not_found;

    const instanciasWithStatus = await InstanciaEvento.count({
      where: { estadoId: id },
    });

    return instanciasWithStatus === 0;
  }

  private async getCountAndMetadata(params: PaginationParams, limit: number) {
    const totalItems = await EstadoInstanciaEvento.count();
    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: params.page || 1,
      itemsPerPage: limit,
    };
  }
}

export const estadoInstanciaEventoService = new EstadoInstanciaEventoService();
export type IEstadoInstanciaEventoService = typeof estadoInstanciaEventoService;
