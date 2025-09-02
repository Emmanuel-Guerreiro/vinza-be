import { Transaction, WhereOptions } from 'sequelize';
import { EstadoInstanciaEvento } from './model';
import {
  CreateEstadoInstanciaEventoDto,
  FindAllParams,
  UpdateEstadoInstanciaEventoDto,
} from './types';
import { errors } from '@/error';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import logger from '@/logger';

class EstadoInstanciaEventoService {
  public async create(dto: CreateEstadoInstanciaEventoDto) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.create(dto);
    return estadoInstanciaEvento;
  }

  public async findAll(
    params: FindAllParams,
  ): Promise<PaginatedResponse<EstadoInstanciaEvento>> {
    logger.debug(
      `estado-instancia-evento findAll params ${JSON.stringify(params)}`,
    );
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(params, {}, limit),
      EstadoInstanciaEvento.findAll({
        order,
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
    return updatedEstadoInstanciaEvento;
  }

  public async delete(id: number) {
    const estadoInstanciaEvento = await EstadoInstanciaEvento.findByPk(id);
    if (!estadoInstanciaEvento)
      throw errors.app.instancia_evento.estado_not_found;
    await estadoInstanciaEvento.destroy();
    return estadoInstanciaEvento;
  }

  private async getCountAndMetadata(
    params: FindAllParams,
    where: WhereOptions,
    limit: number,
  ) {
    const totalItems = await EstadoInstanciaEvento.count({ where });
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
