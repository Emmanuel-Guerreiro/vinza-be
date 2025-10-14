import { auditEmitter } from '@/audit/event';
import { Bodega } from '@/bodega/model';
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
import {
  CreateEventoDto,
  CreateEventoWithMultimediaDto,
  FindAllParams,
  UpdateEventoDto,
} from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import { RecurrenciaEvento } from './model';
import { instanciaEventoService } from '@/instancia-evento/service';
import { EstadoInstanciaEvento } from '@/estado-instancia-evento/model';
import { InstanciaEvento } from '@/instancia-evento/model';
import { Reserva } from '@/reserva/model';
import { EstadoReserva } from '@/estado-reserva/model';
import { Valoracion, ValoracionMedia } from '@/valoracion/model';
import { valoracionService } from '@/valoracion/service';
import { multimediaService } from '@/multimedia/service';
import { MultimediaEventos } from '@/multimedia/model';

class EventoService {
  public async createWithMultimedia(
    dto: CreateEventoWithMultimediaDto,
    files: Express.Multer.File[],
  ) {
    const transaction = await sequelize.transaction();
    try {
      const { multimediaPortada, ...eventoDto } = dto;
      const evento = await this.create(eventoDto, transaction);
      if (files.length) {
        await multimediaService.uploadMultipleFilesForEvento(
          { files, portadaFileName: multimediaPortada, eventoId: evento.id },
          transaction,
        );
      }

      await transaction.commit();
      auditEmitter.emitEntry({
        tipoEvento: 'evento:create',
        valor: evento.dataValues,
      });
      return evento;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error);
      await transaction.rollback();
      throw error;
    }
  }

  public async create(dto: CreateEventoDto, t?: Transaction) {
    const transaction = t || (await sequelize.transaction());
    const shouldCommit = !t; // Only commit if we created the transaction
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

      // Load all relations within the transaction before commit
      await evento.reload({
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
          {
            model: MultimediaEventos,
          },
        ],
        transaction,
      });

      if (shouldCommit) {
        await transaction.commit();
      }

      auditEmitter.emitEntry({
        tipoEvento: 'evento:create',
        valor: evento.dataValues,
      });

      return evento;
    } catch (error) {
      logger.error(`error create evento ${JSON.stringify(error)}`);
      if (shouldCommit) {
        await transaction.rollback();
      }
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filtros: Record<string, any> | null = {
      fecha: {},
    };

    if (params.fechaDesde && params.fechaHasta) {
      filtros.fecha = {
        [Op.between]: [params.fechaDesde, params.fechaHasta],
      };
    } else if (params.fechaDesde) {
      filtros.fecha = {
        [Op.gte]: params.fechaDesde,
      };
    } else if (params.fechaHasta) {
      filtros.fecha = {
        [Op.lte]: params.fechaHasta,
      };
    }
    if (!params.fechaDesde && !params.fechaHasta) {
      filtros = null;
    }

    const queryOptions: FindOptions = {
      where,
      order,
      limit,
      offset,
      include: [
        {
          model: MultimediaEventos,
          as: 'multimedia',
        },
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
          where: filtros || undefined,
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

  public async findOne(id: number, transaction?: Transaction) {
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
        {
          model: MultimediaEventos,
          as: 'multimedia',
        },
      ],
      transaction,
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
      const {
        recurrencias,
        addMultimedia,
        removeMultimedia,
        multimediaPortada,
        ...eventoData
      } = dto;

      if (recurrencias !== undefined) {
        // Eliminar recurrencias existentes
        await RecurrenciaEvento.destroy({
          where: { eventoId: id },
          transaction,
        });

        // Crear nuevas recurrencias si se proporcionan
        if (recurrencias.length > 0) {
          const recurrenciasData = recurrencias.map((recurrencia) => ({
            ...recurrencia,
            eventoId: id,
          }));

          await RecurrenciaEvento.bulkCreate(recurrenciasData, { transaction });
        }
      }

      if (addMultimedia || removeMultimedia || multimediaPortada) {
        await multimediaService.updateMultimediaForEvento(
          {
            files: addMultimedia || [],
            eventoId: id,
            portadaFileName: multimediaPortada,
            removeMultimediaIds: removeMultimedia,
          },
          transaction,
        );
      }

      await evento.update(eventoData, { transaction });

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

    if (params.precioMaximo && !params.precioMinimo) {
      where.precio = {
        [Op.lte]: params.precioMaximo,
      };
    }

    if (params.precioMinimo && !params.precioMaximo) {
      where.precio = {
        [Op.gte]: params.precioMinimo,
      };
    }

    if (params.precioMinimo && params.precioMaximo) {
      where.precio = {
        [Op.between]: [params.precioMinimo, params.precioMaximo],
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

    const res = await instanciaEventoService.findAll({
      eventoId,
      page: 1,
      limit: 1000, // Límite alto para obtener todas las instancias
      orderBy: 'id:asc',
    });

    return res;
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
   * Obtiene las reservas de una instancia específica de un evento
   */
  public async obtenerReservasInstancia(instanciaId: number) {
    return instanciaEventoService.obtenerReservasInstancia(instanciaId);
  }

  /**
   * Verifica si un evento puede ser eliminado
   * Un evento no puede ser eliminado si tiene reservas pendientes o confirmadas
   */
  public async canDelete(eventoId: number) {
    // Verificar que el evento existe
    const evento = await this.findOne(eventoId);
    if (!evento) throw errors.app.evento.not_found;

    // Obtener todas las instancias del evento
    const instancias = await InstanciaEvento.findAll({
      where: { eventoId },
      attributes: ['id'],
    });

    if (instancias.length === 0) {
      return { canDelete: true };
    }

    const instanciaIds = instancias.map((instancia) => instancia.id);

    // Buscar reservas con estado PENDIENTE o CONFIRMADA
    const reservasConEstados = await Reserva.findAll({
      where: {
        instanciaEventoId: {
          [Op.in]: instanciaIds,
        },
      },
      include: [
        {
          model: EstadoReserva,
          as: 'estados',
          where: {
            nombre: {
              [Op.in]: ['PENDIENTE', 'CONFIRMADA'],
            },
          },
          required: true,
        },
      ],
    });

    if (reservasConEstados.length > 0) {
      return {
        canDelete: false,
        reason:
          'El evento no puede ser eliminado porque tiene reservas pendientes o confirmadas',
      };
    }

    return { canDelete: true };
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

    // Validar que no hayan 2 eventos activos con el mismo nombre en la misma bodega
    if (dto.nombre && dto.sucursalId) {
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
