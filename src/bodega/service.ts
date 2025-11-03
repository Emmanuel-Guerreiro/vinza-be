import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { sucursalService } from '@/sucursal/service';
import { Bodega } from './model';
import {
  CreateBodegaDto,
  CreateBodegaWithMultimediaDto,
  FindAllParams,
  UpdateBodegaDto,
  UpdateBodegaWithMultimediaDto,
  ValidateBodegaDto,
  BodegaMetrics,
  IngresoMensual,
  EventoPorCategoria,
  OcupacionSemanal,
} from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Sucursal } from '@/sucursal/model';
import { multimediaService } from '@/multimedia/service';
import { MultimediaBodegas } from '@/multimedia/model';
import { usersService } from '@/users/service';
import { Evento } from '@/evento/model';
import { EstadoEvento } from '@/estado-evento/model';
import { EstadoEventoEnum } from '@/estado-evento/enum';
import { ValoracionMedia } from '@/valoracion/model';
import { Reserva } from '@/reserva/model';
import { EstadoReserva } from '@/estado-reserva/model';
import { EstadoReservaEnum } from '@/estado-reserva/enum';
import { InstanciaEvento } from '@/instancia-evento/model';
import { CategoriaEvento } from '@/categoria-evento/model';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

class BodegaService {
  public async createWithMultimedia(
    dto: CreateBodegaWithMultimediaDto,
    files: Express.Multer.File[],
  ) {
    const transaction = await sequelize.transaction();
    try {
      const bodega = await Bodega.create(
        {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          telefono: dto.telefono,
        },
        { transaction },
      );
      if (files.length) {
        await multimediaService.uploadMultipleFilesForBodega(
          {
            files,
            portadaFileName: dto.multimediaPortada,
            bodegaId: bodega.id,
          },
          transaction,
        );
      }
      // Create the first sucursal as main
      await sucursalService.create(
        {
          nombre: dto.nombre,
          es_principal: true,
          direccion: dto.direccion,
          aclaraciones: dto.aclaraciones,
          bodegaId: bodega.id,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
        transaction,
      );

      const user = await usersService.findOne(dto.firstUserId, transaction);
      if (!user) throw errors.app.user.not_found;
      await user.update({ bodegaId: bodega.id }, { transaction });

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'bodega:create',
        valor: bodega.dataValues,
      });
      return bodega;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async create(
    dto: CreateBodegaDto,
    disableAudit: boolean = false,
    t?: Transaction,
  ) {
    const transaction = t || (await sequelize.transaction());
    try {
      const { latitude, longitude, ...rest } = dto;
      const bodega = await Bodega.create(rest, { transaction });
      // Create the first sucursal as main
      sucursalService.create(
        {
          nombre: dto.nombre,
          es_principal: true,
          direccion: dto.direccion,
          aclaraciones: dto.aclaraciones,
          bodegaId: bodega.id,
          latitude: latitude,
          longitude: longitude,
        },
        transaction,
      );

      if (!disableAudit) {
        auditEmitter.emitEntry({
          tipoEvento: 'bodega:create',
          valor: bodega.dataValues,
        });
      }
      const bodegaCompleted = await this.findOne(bodega.id, transaction);
      const user = await usersService.findOne(dto.firstUserId, transaction);
      if (!user) throw errors.app.user.not_found;
      await user.update({ bodegaId: bodega.id }, { transaction });

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'bodega:create',
        valor: bodega.dataValues,
      });
      if (!t) await transaction.commit();
      return bodegaCompleted;
    } catch (error) {
      if (!t) await transaction.rollback();
      throw error;
    }
  }

  public async findAll(
    params: FindAllParams,
  ): Promise<PaginatedResponse<Bodega>> {
    logger.debug(`bodega findAll params ${JSON.stringify(params)}`);
    const where = this.generateWhereConditions(params);
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);
    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(params, where, limit),
      Bodega.findAll({
        where,
        order,
        limit,
        offset,
        include: [
          {
            model: MultimediaBodegas,
            as: 'multimedia',
          },
          {
            model: Sucursal,
            as: 'sucursales',
          },
        ],
      }),
    ]);

    return {
      items,
      meta,
    };
  }

  public async findOne(id: number, transaction?: Transaction) {
    const bodega = await Bodega.findByPk(id, {
      include: [
        {
          model: Sucursal,
          as: 'sucursales',
        },
        {
          model: MultimediaBodegas,
        },
      ],
      transaction,
    });
    if (!bodega) {
      throw errors.app.bodega.not_found;
    }
    return bodega;
  }

  public async update(id: number, dto: UpdateBodegaDto) {
    const transaction = await sequelize.transaction();
    try {
      const bodega = await Bodega.findByPk(id, { transaction });
      if (!bodega) {
        throw errors.app.bodega.not_found;
      }
      const updatedBodega = await bodega.update(dto, {
        transaction,
        returning: true,
      });
      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'bodega:update',
        valor: updatedBodega.dataValues,
      });
      return updatedBodega;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async updateWithMultimedia(
    id: number,
    dto: UpdateBodegaWithMultimediaDto,
    files: Express.Multer.File[],
  ) {
    const transaction = await sequelize.transaction();
    try {
      const bodega = await Bodega.findByPk(id, { transaction });
      if (!bodega) {
        throw errors.app.bodega.not_found;
      }

      const { deleteMultimedia, multimediaPortada, ...coreUpdateDto } = dto;

      // Update core bodega fields
      const updatedBodega = await bodega.update(coreUpdateDto, {
        transaction,
        returning: true,
      });

      // Handle multimedia updates
      if (
        (deleteMultimedia && deleteMultimedia.length > 0) ||
        (files && files.length > 0) ||
        multimediaPortada
      ) {
        await multimediaService.updateMultimediaForBodega(
          {
            files: files ?? [],
            bodegaId: id,
            portadaFileName: multimediaPortada,
            removeMultimediaIds: deleteMultimedia,
          },
          transaction,
        );
      }

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'bodega:update',
        valor: updatedBodega.dataValues,
      });
      return updatedBodega;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async delete(id: number) {
    const bodega = await Bodega.findByPk(id);
    if (!bodega) {
      throw errors.app.bodega.not_found;
    }
    await bodega.destroy();

    auditEmitter.emitEntry({
      tipoEvento: 'bodega:delete',
      valor: bodega.dataValues,
    });
    return bodega;
  }

  public async validate(id: number, dto: ValidateBodegaDto) {
    const bodega = await Bodega.findByPk(id);
    if (!bodega) {
      throw errors.app.bodega.not_found;
    }
    await bodega.update({ validada: dto.es_valida ? new Date() : null });
    return bodega;
  }

  public async getMetrics(id: number): Promise<BodegaMetrics> {
    const bodega = await Bodega.findByPk(id);
    if (!bodega) {
      throw errors.app.bodega.not_found;
    }

    // Get all sucursales for this bodega
    const sucursales = await Sucursal.findAll({
      where: { bodegaId: id },
      attributes: ['id'],
    });
    const sucursalIds = sucursales.map((s) => s.id);

    // Execute all metrics calculations in parallel
    const [
      eventosActivos,
      personalActivo,
      puntuacionPromedio,
      bodegasActivas,
      tasaOcupacion,
      ingresosMensuales,
      historialIngresosMensuales,
      eventosPorCategoria,
      ocupacionSemanal,
    ] = await Promise.all([
      this.getEventosActivos(sucursalIds),
      this.getPersonalActivo(id),
      this.getPuntuacionPromedio(sucursalIds),
      this.getBodegasActivas(sucursales.length),
      this.getTasaOcupacion(sucursalIds),
      this.getIngresosMensuales(sucursalIds),
      this.getHistorialIngresosMensuales(sucursalIds),
      this.getEventosPorCategoria(sucursalIds),
      this.getOcupacionSemanal(sucursalIds),
    ]);

    return {
      eventosActivos,
      personalActivo,
      puntuacionPromedio,
      bodegasActivas,
      tasaOcupacion,
      ingresosMensuales,
      historialIngresosMensuales,
      eventosPorCategoria,
      ocupacionSemanal,
    };
  }

  private async getEventosActivos(sucursalIds: number[]): Promise<number> {
    return await Evento.count({
      where: {
        sucursalId: {
          [Op.in]: sucursalIds,
        },
      },
      include: [
        {
          model: EstadoEvento,
          as: 'estado',
          where: {
            nombre: EstadoEventoEnum.ACTIVO,
          },
          required: true,
        },
      ],
    });
  }

  private async getPersonalActivo(bodegaId: number): Promise<number> {
    const personalActivo = await usersService.findAllByBodega(bodegaId);
    return personalActivo.length;
  }

  private async getPuntuacionPromedio(sucursalIds: number[]): Promise<number> {
    const valoracionesMedias = await ValoracionMedia.findAll({
      include: [
        {
          model: Evento,
          as: 'evento',
          where: {
            sucursalId: {
              [Op.in]: sucursalIds,
            },
          },
          required: true,
        },
      ],
    });

    const puntuacionPromedio =
      valoracionesMedias.length > 0
        ? valoracionesMedias.reduce(
            (sum, vm) => sum + Number(vm.valor_medio),
            0,
          ) / valoracionesMedias.length
        : 0;

    return Math.round(puntuacionPromedio * 100) / 100; // Round to 2 decimal places
  }

  private async getBodegasActivas(sucursalesCount: number): Promise<number> {
    return sucursalesCount;
  }

  private async getTasaOcupacion(sucursalIds: number[]): Promise<number> {
    const reservasConfirmadas = await Reserva.findAll({
      include: [
        {
          model: EstadoReserva,
          as: 'estados',
          where: {
            nombre: EstadoReservaEnum.CONFIRMADA,
          },
          required: true,
        },
        {
          model: InstanciaEvento,
          include: [
            {
              model: Evento,
              where: {
                sucursalId: {
                  [Op.in]: sucursalIds,
                },
              },
              required: true,
            },
          ],
        },
      ],
    });

    const totalOcupacionConfirmada = reservasConfirmadas.reduce(
      (sum, reserva) => sum + reserva.cantidadGente,
      0,
    );

    const totalCupoEventos = await Evento.sum('cupo', {
      where: {
        sucursalId: {
          [Op.in]: sucursalIds,
        },
      },
    });

    const tasaOcupacion =
      totalCupoEventos > 0
        ? (totalOcupacionConfirmada / totalCupoEventos) * 100
        : 0;

    return Math.round(tasaOcupacion * 100) / 100; // Round to 2 decimal places
  }

  private async getIngresosMensuales(sucursalIds: number[]): Promise<number> {
    // Get current month start and end dates using dayjs
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();

    const reservasConfirmadas = await Reserva.findAll({
      where: {
        // @ts-expect-error - Database column name is created_at
        created_at: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      include: [
        {
          model: EstadoReserva,
          as: 'estados',
          where: {
            nombre: EstadoReservaEnum.CONFIRMADA,
          },
          required: true,
        },
        {
          model: InstanciaEvento,
          include: [
            {
              model: Evento,
              where: {
                sucursalId: {
                  [Op.in]: sucursalIds,
                },
              },
              required: true,
            },
          ],
        },
      ],
    });

    // Calculate total revenue: cantidadGente * precio for each confirmed reservation
    const ingresosMensuales = reservasConfirmadas.reduce(
      (sum, reserva) => sum + reserva.cantidadGente * Number(reserva.precio),
      0,
    );

    return Math.round(ingresosMensuales * 100) / 100; // Round to 2 decimal places
  }

  private async getHistorialIngresosMensuales(
    sucursalIds: number[],
  ): Promise<IngresoMensual[]> {
    const historial: IngresoMensual[] = [];

    // Set Spanish locale for month names
    dayjs.locale('es');

    // Get the last 5 months using dayjs
    for (let i = 4; i >= 0; i--) {
      const targetDate = dayjs().subtract(i, 'month');
      const startOfMonth = targetDate.startOf('month').toDate();
      const endOfMonth = targetDate.endOf('month').toDate();

      const reservasConfirmadas = await Reserva.findAll({
        where: {
          // @ts-expect-error - Database column name is created_at
          created_at: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
        include: [
          {
            model: EstadoReserva,
            as: 'estados',
            where: {
              nombre: EstadoReservaEnum.CONFIRMADA,
            },
            required: true,
          },
          {
            model: InstanciaEvento,
            include: [
              {
                model: Evento,
                where: {
                  sucursalId: {
                    [Op.in]: sucursalIds,
                  },
                },
                required: true,
              },
            ],
          },
        ],
      });

      const ingresosDelMes = reservasConfirmadas.reduce(
        (sum, reserva) => sum + reserva.cantidadGente * Number(reserva.precio),
        0,
      );

      historial.push({
        month: targetDate.format('YYYY-MMMM'), // YYYY-MonthName format using dayjs
        ingresos: ingresosDelMes,
      });
    }

    return historial;
  }

  private async getEventosPorCategoria(
    sucursalIds: number[],
  ): Promise<EventoPorCategoria[]> {
    const eventos = await Evento.findAll({
      where: {
        sucursalId: {
          [Op.in]: sucursalIds,
        },
      },
      include: [
        {
          model: CategoriaEvento,
          as: 'categoria',
          required: true,
        },
      ],
    });

    // Group events by category and count them
    const eventosPorCategoriaMap = new Map<string, number>();

    eventos.forEach((evento) => {
      const categoriaNombre = evento.categoria?.nombre || 'Sin Categoría';
      const currentCount = eventosPorCategoriaMap.get(categoriaNombre) || 0;
      eventosPorCategoriaMap.set(categoriaNombre, currentCount + 1);
    });

    // Convert map to array
    const eventosPorCategoria: EventoPorCategoria[] = Array.from(
      eventosPorCategoriaMap.entries(),
    ).map(([categoria, cantidad]) => ({
      categoria,
      cantidad,
    }));

    return eventosPorCategoria;
  }

  private async getOcupacionSemanal(
    sucursalIds: number[],
  ): Promise<OcupacionSemanal[]> {
    const ocupacionSemanal: OcupacionSemanal[] = [];

    // Set Spanish locale for day names
    dayjs.locale('es');

    // Get the next 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const targetDate = dayjs().add(i, 'day');
      const startOfDay = targetDate.startOf('day').toDate();
      const endOfDay = targetDate.endOf('day').toDate();

      const reservasConfirmadas = await Reserva.findAll({
        where: {
          // @ts-expect-error - Database column name is created_at
          created_at: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        include: [
          {
            model: EstadoReserva,
            as: 'estados',
            where: {
              nombre: EstadoReservaEnum.CONFIRMADA,
            },
            required: true,
          },
          {
            model: InstanciaEvento,
            include: [
              {
                model: Evento,
                where: {
                  sucursalId: {
                    [Op.in]: sucursalIds,
                  },
                },
                required: true,
              },
            ],
          },
        ],
      });

      ocupacionSemanal.push({
        dia: targetDate.format('dddd'), // Full day name in Spanish
        fecha: targetDate.format('YYYY-MM-DD'), // Date in YYYY-MM-DD format
        reservasConfirmadas: reservasConfirmadas.length,
      });
    }

    return ocupacionSemanal;
  }

  /**
   * Generate where conditions for the findAll query based on model specific fields
   * If the filter is based on a related model, it will be handled in the include with where condition
   */
  private generateWhereConditions(params: FindAllParams): WhereOptions {
    const where: WhereOptions = {};

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
    const totalItems = await Bodega.count({
      where,
    });

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: params.page || 1,
      itemsPerPage: limit,
    };
  }
}

export const bodegaService = new BodegaService();

export type IBodegaService = typeof bodegaService;
