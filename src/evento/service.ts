import { auditEmitter } from '@/audit/event';
import { CategoriaEvento } from '@/categoria-evento/model';
import { categoriaEventoService } from '@/categoria-evento/service';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { EstadoEvento } from '@/estado-evento/model';
import { estadoEventoService } from '@/estado-evento/service';
import { Sucursal } from '@/sucursal/model';
import { Op, WhereOptions } from 'sequelize';
import { Evento } from './model';
import { CreateEventoDto, FindAllParams, UpdateEventoDto } from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';

class EventoService {
  public async create(dto: CreateEventoDto) {
    //comentario
    const transaction = await sequelize.transaction();
    try {
      let evento = await Evento.create(dto, { transaction });

      if (dto.estadoId) {
        const estadoEvento = await estadoEventoService.findOne(
          dto.estadoId,
          transaction,
        );
        if (!estadoEvento) throw errors.app.evento.estado_not_found;
        await evento.$set('estados', [estadoEvento.id], { transaction });
      }

      if (dto.categoriaId) {
        const categoriaEvento = await categoriaEventoService.findOne(
          dto.categoriaId,
          transaction,
        );

        await evento.$set('categorias', [categoriaEvento.id], { transaction });
      }

      evento = await evento.save({ transaction, returning: true });

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'evento:create',
        valor: evento.dataValues,
      });

      return evento;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async findAll(
    params: FindAllParams,
  ): Promise<PaginatedResponse<Evento>> {
    logger.debug(`evento findAll params ${JSON.stringify(params)}`);
    const where = this.generateWhereConditions(params);
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(params, where, limit),
      Evento.findAll({
        where,
        order,
        limit,
        offset,
        include: [
          // Where and required will work as a filter when its based on related models
          {
            model: CategoriaEvento,
            where: params.categoriaId ? { id: params.categoriaId } : undefined,
            required: !!params.categoriaId,
          },
          {
            model: EstadoEvento,
            where: params.estadoId ? { id: params.estadoId } : undefined,
            required: !!params.estadoId,
          },
          {
            model: Sucursal,
            where: params.bodegaId ? { bodegaId: params.bodegaId } : undefined,
            required: !!params.bodegaId,
          },
        ],
      }),
    ]);

    return {
      items,
      meta,
    };
  }

  public async findOne(id: number) {
    const evento = await Evento.findByPk(id, {
      include: [
        {
          model: CategoriaEvento,
        },
        {
          model: EstadoEvento,
        },
      ],
    });
    if (!evento) throw errors.app.evento.not_found;

    return evento;
  }

  public async update(id: number, dto: UpdateEventoDto) {
    const transaction = await sequelize.transaction();
    try {
      const evento = await Evento.findByPk(id);
      if (!evento) throw errors.app.evento.not_found;

      if (dto.estadoId) {
        const estadoEvento = await estadoEventoService.findOne(
          dto.estadoId,
          transaction,
        );
        if (!estadoEvento) throw errors.app.evento.estado_not_found;
        await evento.$set('estados', [estadoEvento.id], { transaction });
      }

      if (dto.categoriaId) {
        const categoriaEvento = await categoriaEventoService.findOne(
          dto.categoriaId,
          transaction,
        );

        await evento.$set('categorias', [categoriaEvento.id], { transaction });
      }

      const updatedEvento = await evento.update(dto, {
        returning: true,
        transaction,
      });

      auditEmitter.emitEntry({
        tipoEvento: 'evento:update',
        valor: updatedEvento.dataValues,
      });

      return updatedEvento;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async delete(id: number) {
    const evento = await Evento.findByPk(id);
    if (!evento) throw errors.app.evento.not_found;
    await evento.destroy();

    auditEmitter.emitEntry({
      tipoEvento: 'evento:delete',
      valor: evento.dataValues,
    });
    return evento;
  }

  /**
   * Generate where conditions for the findAll query based on model specific fields
   * If the filter is based on a related model, it will be handled in the include with where condition
   *
   * TODO:
   * - Puntuacion minima
   * - Fechas bien implementado
   */
  private generateWhereConditions(params: FindAllParams): WhereOptions {
    const where: WhereOptions = {};

    if (params.sucursalId) {
      where.sucursalId = params.sucursalId;
    }

    // Es horrible pero funciona
    if (params.fechaDesde && params.fechaHasta) {
      where.created_at = {
        [Op.and]: [
          {
            [Op.gte]: params.fechaDesde,
          },
          {
            [Op.lte]: params.fechaHasta,
          },
        ],
      };
    }

    if (params.fechaDesde && !params.fechaHasta) {
      where.created_at = {
        [Op.gte]: params.fechaDesde,
      };
    }

    if (params.fechaHasta && !params.fechaDesde) {
      where.created_at = {
        [Op.lte]: params.fechaHasta,
      };
    }

    if (params.precioMaximo) {
      where.precio = {
        [Op.lte]: params.precioMaximo,
      };
    }

    if (params.puntuacionMinima) {
      // This will need to be implemented when puntuacion field is added to Evento model
    }

    if (params.nombre) {
      where.nombre = {
        [Op.iLike]: `%${params.nombre}%`,
      };
    }

    return where;
  }

  /**
   * Get total count of items and generate complete pagination metadata
   */
  private async getCountAndMetadata(
    params: FindAllParams,
    where: WhereOptions,
    limit: number,
  ) {
    const totalItems = await Evento.count({
      where,
      include: [
        {
          model: CategoriaEvento,
          where: params.categoriaId ? { id: params.categoriaId } : undefined,
          required: !!params.categoriaId,
        },
        {
          model: EstadoEvento,
          where: params.estadoId ? { id: params.estadoId } : undefined,
          required: !!params.estadoId,
        },
        {
          model: Sucursal,
          where: params.bodegaId ? { bodegaId: params.bodegaId } : undefined,
          required: !!params.bodegaId,
        },
      ],
    });

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: params.page || 1,
      itemsPerPage: limit,
    };
  }
}

export const eventoService = new EventoService();
export type IEventoService = typeof eventoService;
