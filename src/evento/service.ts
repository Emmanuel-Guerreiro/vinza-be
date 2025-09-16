import { auditEmitter } from '@/audit/event';
import { CategoriaEvento } from '@/categoria-evento/model';
import { categoriaEventoService } from '@/categoria-evento/service';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { EstadoEvento } from '@/estado-evento/model';
import { estadoEventoService } from '@/estado-evento/service';
import { Sucursal } from '@/sucursal/model';
import { Op, WhereOptions, FindOptions, Transaction } from 'sequelize';
import { sucursalService } from '@/sucursal/service';
import { Evento } from './model';
import { CreateEventoDto, FindAllParams, UpdateEventoDto } from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import { RecurrenciaEvento } from './model';
import { Bodega } from '@/bodega/model';
import { instanciaEventoService } from '@/instancia-evento/service';
import { InstanciaEvento } from '@/instancia-evento/model';
import { Valoracion, ValoracionMedia } from '@/valoracion/model';
import { valoracionService } from '@/valoracion/service';
import { EstadoInstanciaEvento } from '@/estado-instancia-evento/model';

class EventoService {
  public async create(dto: CreateEventoDto) {
    const transaction = await sequelize.transaction();
    try {
      // Validar datos del evento
      await this.validateEventoData(dto, transaction);

      // Validar que se proporcionen recurrencias (ahora son obligatorias)
      if (!dto.recurrencias || dto.recurrencias.length === 0) {
        throw errors.app.evento.recurrencias_required;
      }

      const evento = await Evento.create(dto, { transaction });

      // Crear las recurrencias obligatorias
      const recurrenciasData = dto.recurrencias.map((recurrencia) => ({
        ...recurrencia,
        eventoId: evento.id,
      }));

      await RecurrenciaEvento.bulkCreate(recurrenciasData, { transaction });

      await valoracionService.initializeValoracionMedia(evento.id, transaction);

      // Generar instancias automáticamente después de crear el evento

      await instanciaEventoService.generarInstanciasParaEvento(
        {
          eventoId: evento.id,
        },
        transaction,
      );
      logger.info(
        `Instancias generadas automáticamente para evento ${evento.id}`,
      );

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'evento:create',
        valor: evento.dataValues,
      });

      return this.findOne(evento.id);
    } catch (error) {
      logger.error(`error create evento ${JSON.stringify(error)}`);
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

    const queryOptions: FindOptions = {
      where,
      order,
      limit,
      offset,
      include: [
        {
          as: 'categoria',
          model: CategoriaEvento,
          where: params.categoriaId ? { id: params.categoriaId } : undefined,
          required: !!params.categoriaId,
        },
        {
          as: 'estado',
          model: EstadoEvento,
          where: params.estadoId ? { id: params.estadoId } : undefined,
          required: !!params.estadoId,
        },
        {
          as: 'sucursal',
          model: Sucursal,
          where: params.bodegaId ? { bodegaId: params.bodegaId } : undefined,
          required: !!params.bodegaId,
          include: [
            {
              model: Bodega,
              as: 'bodega',
            },
          ],
        },
        {
          model: RecurrenciaEvento,
          as: 'recurrencias',
        },
        {
          as: 'valoracionMedia',
          model: ValoracionMedia,
          where: params.puntuacionMinima
            ? {
                valor_medio: {
                  [Op.gte]: params.puntuacionMinima,
                },
              }
            : undefined,
          required: !!params.puntuacionMinima,
        },
        {
          model: InstanciaEvento,
          as: 'instancias',
          include: [
            {
              as: 'estado',
              model: EstadoInstanciaEvento,
            },
          ],
        },
      ],
    };

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(queryOptions, params.page, limit),
      Evento.findAll(queryOptions),
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
          as: 'categoria',
          model: CategoriaEvento,
        },
        {
          as: 'estado',
          model: EstadoEvento,
        },
        {
          as: 'sucursal',
          model: Sucursal,
          include: [
            {
              as: 'bodega',
              model: Bodega,
            },
          ],
        },
        {
          as: 'recurrencias',
          model: RecurrenciaEvento,
        },
        {
          as: 'valoracionMedia',
          model: ValoracionMedia,
        },
        {
          model: InstanciaEvento,
          as: 'instancias',
          include: [
            {
              as: 'estado',
              model: EstadoInstanciaEvento,
            },
          ],
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

      // Validar datos del evento
      await this.validateEventoData(dto, transaction);

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
    const transaction = await sequelize.transaction();
    try {
      const evento = await Evento.findByPk(id, { transaction });
      if (!evento) throw errors.app.evento.not_found;

      // Eliminar en cascada las dependencias
      await RecurrenciaEvento.destroy({
        where: { eventoId: id },
        transaction,
      });

      await InstanciaEvento.destroy({
        where: { eventoId: id },
        transaction,
      });

      await Valoracion.destroy({
        where: { eventoId: id },
        transaction,
      });

      // Finalmente eliminar el evento
      await evento.destroy({ transaction });

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'evento:delete',
        valor: evento.dataValues,
      });
      return evento;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Generate where conditions for the findAll query based on model specific fields
   * If the filter is based on a related model, it will be handled in the include with where condition
   *
   * TODO:
   * - Fechas bien implementado
   */
  private generateWhereConditions(params: FindAllParams): WhereOptions {
    const where: WhereOptions<Evento> = {};

    if (params.sucursalId) {
      where.sucursalId = params.sucursalId;
    }

    // Es horrible pero funciona
    if (params.fechaDesde && params.fechaHasta) {
      where.createdAt = {
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
      where.createdAt = {
        [Op.gte]: params.fechaDesde,
      };
    }

    if (params.fechaHasta && !params.fechaDesde) {
      where.createdAt = {
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
    queryOptions: FindOptions,
    page: number,
    limit: number,
  ) {
    const totalItems = await Evento.count(queryOptions);

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page || 1,
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
  async findByInstanciaEvento(
    instanciaEventoId: number,
    transaction?: Transaction,
  ) {
    return Evento.findOne({
      transaction,
      include: [
        { model: Sucursal, as: 'sucursal' },
        {
          model: InstanciaEvento,
          as: 'instancias',
          where: { id: instanciaEventoId },
        },
      ],
    });
  }

  /**
   * Fuerza la generación de instancias para un evento específico
   */
  public async generarInstanciasEvento(
    eventoId: number,
  ): Promise<{ totalInstanciasCreadas: number }> {
    const evento = await this.findOne(eventoId);
    if (!evento) throw errors.app.evento.not_found;

    // Verificar que el evento tenga recurrencias
    if (!evento.recurrencias || evento.recurrencias.length === 0) {
      throw errors.app.evento.recurrencias_required;
    }

    // Llamar al servicio de instancia-evento para generar instancias del evento específico
    return await instanciaEventoService.generarInstanciasParaEvento({
      eventoId,
    });
  }

  /**
   * Suspende una instancia específica de un evento
   */
  public async suspenderInstanciaEvento(instanciaId: number) {
    // Verificar que la instancia existe
    const instancia = await instanciaEventoService.findOne(instanciaId);
    if (!instancia) throw errors.app.instancia_evento.not_found;

    return await instanciaEventoService.suspenderInstancia(instanciaId);
  }

  /**
   * Reactiva una instancia específica de un evento
   */
  public async reactivarInstanciaEvento(instanciaId: number) {
    // Verificar que la instancia existe
    const instancia = await instanciaEventoService.findOne(instanciaId);
    if (!instancia) throw errors.app.instancia_evento.not_found;

    return await instanciaEventoService.reactivarInstancia(instanciaId);
  }

  /**
   * Valida los datos del evento (estadoId, categoriaId, sucursalId, nombre duplicado)
   */
  private async validateEventoData(
    dto: CreateEventoDto | UpdateEventoDto,
    transaction?: Transaction,
  ) {
    // Validar que estadoId exista si se proporciona
    if (dto.estadoId) {
      const estadoEvento = await estadoEventoService.findOne(
        dto.estadoId,
        transaction,
      );
      if (!estadoEvento) throw errors.app.evento.estado_not_found;
    }

    // Validar que categoriaId exista si se proporciona
    if (dto.categoriaId) {
      const categoriaEvento = await categoriaEventoService.findOne(
        dto.categoriaId,
        transaction,
      );
      if (!categoriaEvento) throw errors.app.evento.categoria_evento_not_found;
    }

    // Validar que sucursalId exista si se proporciona
    if (dto.sucursalId) {
      const sucursal = await sucursalService.findOne(dto.sucursalId);
      if (!sucursal) throw errors.app.sucursal.not_found;
    }

    // Validar que el nombre no esté duplicado en la misma bodega (solo para create)
    if (
      'nombre' in dto &&
      dto.nombre &&
      'sucursalId' in dto &&
      dto.sucursalId
    ) {
      const existingEvento = await Evento.findOne({
        where: {
          nombre: dto.nombre,
          sucursalId: dto.sucursalId,
        },
        include: [
          {
            model: Sucursal,
            include: [
              {
                model: Bodega,
              },
            ],
          },
        ],
        transaction,
      });

      if (existingEvento) {
        throw errors.app.evento.nombre_duplicate;
      }
    }
  }
}

export const eventoService = new EventoService();
export type IEventoService = typeof eventoService;
