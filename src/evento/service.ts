import { auditEmitter } from '@/audit/event';
import { CategoriaEvento } from '@/categoria-evento/model';
import { categoriaEventoService } from '@/categoria-evento/service';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { EstadoEvento } from '@/estado-evento/model';
import { estadoEventoService } from '@/estado-evento/service';
import { Sucursal } from '@/sucursal/model';
import { Op, WhereOptions, FindOptions } from 'sequelize';
import { Evento } from './model';
import {
  CreateEventoDto,
  FindAllParams,
  UpdateEventoDto,
  EventoWithRating,
} from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import { RecurrenciaEvento } from '@/recurrencia-evento/model';
import { Bodega } from '@/bodega/model';
import { instanciaEventoService } from '@/instancia-evento';

class EventoService {
  public async create(dto: CreateEventoDto) {
    const transaction = await sequelize.transaction();
    try {
      // Validar que estadoId y categoriaId existan si se proporcionan
      if (dto.estadoId) {
        const estadoEvento = await estadoEventoService.findOne(
          dto.estadoId,
          transaction,
        );
        if (!estadoEvento) throw errors.app.evento.estado_not_found;
      }

      if (dto.categoriaId) {
        const categoriaEvento = await categoriaEventoService.findOne(
          dto.categoriaId,
          transaction,
        );
        if (!categoriaEvento)
          throw errors.app.evento.categoria_evento_not_found;
      }

      // Validar que se proporcionen recurrencias (ahora son obligatorias)
      if (!dto.recurrencias || dto.recurrencias.length === 0) {
        throw errors.app.evento.recurrencias_required;
      }

      let evento = await Evento.create(dto, { transaction });

      // Crear las recurrencias obligatorias
      const recurrenciasData = dto.recurrencias.map((recurrencia) => ({
        ...recurrencia,
        eventoId: evento.id,
      }));

      await RecurrenciaEvento.bulkCreate(recurrenciasData, { transaction });

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
  ): Promise<PaginatedResponse<EventoWithRating>> {
    logger.debug(`evento findAll params ${JSON.stringify(params)}`);
    const where = this.generateWhereConditions(params);
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);

    // Build the query with potential rating filter
    const queryOptions: FindOptions = {
      where,
      order,
      limit,
      offset,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG(v.valor), 0)
              FROM valoraciones v
              WHERE v."eventoId" = "Evento".id
              AND v.deleted_at IS NULL
            )`),
            'promedioValoracion',
          ],
        ],
      },
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
        {
          model: RecurrenciaEvento,
        },
      ],
    };

    // Add rating filter using a subquery in WHERE clause if specified
    if (params.puntuacionMinima) {
      const existingWhere = queryOptions.where || {};
      queryOptions.where = {
        [Op.and]: [
          existingWhere,
          sequelize.literal(`(
            SELECT COALESCE(AVG(v.valor), 0)
            FROM valoraciones v
            WHERE v."eventoId" = "Evento".id
            AND v.deleted_at IS NULL
          ) >= ${params.puntuacionMinima}`),
        ],
      };
    }

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(params, where, limit),
      Evento.findAll(queryOptions) as Promise<EventoWithRating[]>,
    ]);

    return {
      items,
      meta,
    };
  }

  public async findOne(id: number): Promise<EventoWithRating> {
    const evento = (await Evento.findByPk(id, {
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG(v.valor), 0)
              FROM valoraciones v
              WHERE v."eventoId" = "Evento".id
              AND v.deleted_at IS NULL
            )`),
            'promedioValoracion',
          ],
        ],
      },
      include: [
        {
          model: CategoriaEvento,
        },
        {
          model: EstadoEvento,
        },
        {
          model: Sucursal,
          include: [
            {
              model: Bodega,
            },
          ],
        },
        {
          model: RecurrenciaEvento,
        },
        // TODO: Add the relation with instancia-evento
      ],
    })) as EventoWithRating | null;
    if (!evento) throw errors.app.evento.not_found;

    return evento;
  }

  public async update(id: number, dto: UpdateEventoDto) {
    const transaction = await sequelize.transaction();
    try {
      const evento = await Evento.findByPk(id);
      if (!evento) throw errors.app.evento.not_found;

      // Validar que estadoId y categoriaId existan si se proporcionan
      if (dto.estadoId) {
        const estadoEvento = await estadoEventoService.findOne(
          dto.estadoId,
          transaction,
        );
        if (!estadoEvento) throw errors.app.evento.estado_not_found;
      }

      if (dto.categoriaId) {
        const categoriaEvento = await categoriaEventoService.findOne(
          dto.categoriaId,
          transaction,
        );
        if (!categoriaEvento)
          throw errors.app.evento.categoria_evento_not_found;
      }

      // Manejar recurrencias si se proporcionan
      if (dto.recurrencias !== undefined) {
        // Eliminar recurrencias existentes
        await RecurrenciaEvento.destroy({
          where: { eventoId: id },
          transaction,
        });

        // Crear nuevas recurrencias si se proporcionan
        if (dto.recurrencias.length > 0) {
          const recurrenciasData = dto.recurrencias.map((recurrencia) => ({
            ...recurrencia,
            eventoId: id,
          }));

          await RecurrenciaEvento.bulkCreate(recurrenciasData, { transaction });
        }
      }

      // Filtrar campos que no pertenecen al modelo Evento
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { recurrencias, ...eventoData } = dto;

      // Actualizar el evento usando la transacción
      await evento.update(eventoData, { transaction });

      // Recargar el evento para obtener los datos actualizados
      await evento.reload({ transaction });

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'evento:update',
        valor: evento.dataValues,
      });

      return evento;
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
    let countQuery: FindOptions = {
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
    };

    // If rating filter is applied, we need to use a different approach for counting
    if (params.puntuacionMinima) {
      // For rating filtering, we'll use a simpler approach by counting all events first
      // and then applying the rating filter in the main query
      // This is less efficient but avoids complex SQL generation issues
      countQuery = {
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
      };
    }

    const totalItems = await Evento.count(countQuery);

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: params.page || 1,
      itemsPerPage: limit,
    };
  }

  /**
   * Obtiene todas las instancias de un evento específico
   */
  public async getInstanciasEvento(eventoId: number) {
    const evento = await this.findOne(eventoId);
    if (!evento) throw errors.app.evento.not_found;

    return await instanciaEventoService.findAll({
      eventoId,
      page: 1,
      limit: 1000, // Límite alto para obtener todas las instancias
      orderBy: 'id:asc',
    });
  }

  /**
   * Fuerza la generación de instancias para un evento específico
   */
  public async generarInstanciasEvento(eventoId: number): Promise<
    | { totalInstanciasCreadas: number }
    | {
        mensaje: string;
        mensaje_eng: string;
        eventoId: number;
        nombreEvento: string;
        tipo: 'evento_unico';
        instanciasGeneradas: number;
        recomendacion: string;
      }
    | undefined
  > {
    const evento = await this.findOne(eventoId);
    if (!evento) throw errors.app.evento.not_found;

    // Verificar que el evento tenga recurrencias
    if (!evento.recurrencias || evento.recurrencias.length === 0) {
      // En lugar de fallar, retornar una respuesta coherente
      return {
        mensaje: 'Este evento no tiene recurrencias configuradas',
        mensaje_eng: 'This event has no recurrences configured',
        eventoId: evento.id,
        nombreEvento: evento.nombre,
        tipo: 'evento_unico',
        instanciasGeneradas: 0,
        recomendacion: 'Para generar instancias, el evento debe tener recurrencias configuradas'
      };
    }

    // Llamar al servicio de instancia-evento para generar instancias
    return await instanciaEventoService.generarInstanciasAutomaticamente();
  }

  /**
   * Suspende una instancia específica de un evento
   */
  public async suspenderInstanciaEvento(eventoId: number, instanciaId: number) {
    const evento = await this.findOne(eventoId);
    if (!evento) throw errors.app.evento.not_found;

    // Verificar que la instancia pertenezca al evento
    const instancia = await instanciaEventoService.findOne(instanciaId);
    if (!instancia) throw errors.app.instancia_evento.not_found;
    
    if (instancia.eventoId !== eventoId) {
      throw errors.app.evento.instancia_not_belongs_to_evento;
    }

    return await instanciaEventoService.suspenderInstancia(instanciaId);
  }

  /**
   * Reactiva una instancia específica de un evento
   */
  public async reactivarInstanciaEvento(eventoId: number, instanciaId: number) {
    const evento = await this.findOne(eventoId);
    if (!evento) throw errors.app.evento.not_found;

    // Verificar que la instancia pertenezca al evento
    const instancia = await instanciaEventoService.findOne(instanciaId);
    if (!instancia) throw errors.app.instancia_evento.not_found;
    
    if (instancia.eventoId !== eventoId) {
      throw errors.app.evento.instancia_not_belongs_to_evento;
    }

    return await instanciaEventoService.reactivarInstancia(instanciaId);
  }
}

export const eventoService = new EventoService();
export type IEventoService = typeof eventoService;
