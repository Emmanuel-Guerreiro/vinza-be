import { sequelize } from '@/db';
import { errors } from '@/error';
import { Evento } from '@/evento/model';
import { MaximosDiasAdelanteReserva } from '@/maximos-dias-adelante-reserva/model';
import { RecurrenciaEvento } from '@/evento/model';
import { EstadoInstanciaEvento } from '@/estado-instancia-evento/model';
import { EstadoInstanciaEventoEnum } from '@/estado-instancia-evento/enum';
import { Op, WhereOptions, FindOptions, Transaction } from 'sequelize';
import { InstanciaEvento } from './model';
import {
  FindAllParams,
  InstanciaEventoWithRelations,
  CreateInstanciaEventoDto,
  UpdateInstanciaEventoDto,
  GenerarInstanciasParaEventoRecurrenteDto,
  GenerarInstanciasDesdeDtoRecurrenciasDto,
} from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import { Reserva } from '@/reserva/model';
import { EstadoReserva } from '@/estado-reserva/model';
import { Recorrido } from '@/recorrido/model';
import { User } from '@/users/model';
import { Sucursal } from '@/sucursal/model';

class InstanciaEventoService {
  public async findAll(
    params: FindAllParams,
  ): Promise<PaginatedResponse<InstanciaEventoWithRelations>> {
    logger.debug(`instanciaEvento findAll params ${JSON.stringify(params)}`);
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
          model: Evento,
          as: 'evento',
          include: [
            {
              model: Sucursal,
              as: 'sucursal',
              required: true,
            },
          ],
        },
        {
          model: RecurrenciaEvento,
          as: 'recurrenciaEvento',
          attributes: ['id', 'dia', 'hora', 'fecha_desde', 'fecha_hasta'],
        },
        {
          model: EstadoInstanciaEvento,
          as: 'estado',
          attributes: ['id', 'nombre'],
          required: false, // LEFT JOIN para incluir instancias sin estado
        },
        {
          model: Reserva,
          as: 'reservas',
          attributes: ['id', 'precio', 'cantidadGente'],
          include: [
            {
              model: EstadoReserva,
              as: 'estados',
              attributes: ['id', 'nombre'],
            },
          ],
        },
      ],
    };

    const { count, rows } = await InstanciaEvento.findAndCountAll(queryOptions);

    const totalPages = Math.ceil(count / limit);

    return {
      items: rows,
      meta: {
        totalItems: count,
        currentPage: Math.floor(offset / limit) + 1,
        itemsPerPage: limit,
        totalPages,
      },
    };
  }

  public async findOne(
    id: number,
    transaction?: Transaction,
  ): Promise<InstanciaEvento | null> {
    return await InstanciaEvento.findByPk(id, {
      transaction,
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id', 'nombre', 'descripcion', 'precio', 'cupo'],
        },
        {
          model: RecurrenciaEvento,
          as: 'recurrenciaEvento',
          attributes: ['id', 'dia', 'hora', 'fecha_desde', 'fecha_hasta'],
        },
        {
          model: EstadoInstanciaEvento,
          as: 'estado',
          attributes: ['id', 'nombre'],
          required: false, // LEFT JOIN para incluir instancias sin estado
        },
      ],
    });
  }

  public async findAllByEventoId(
    eventoId: number,
    transaction?: Transaction,
  ): Promise<InstanciaEvento[]> {
    return await InstanciaEvento.findAll({
      where: { eventoId },
      transaction,
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id', 'nombre', 'descripcion', 'precio', 'cupo'],
        },
        {
          model: RecurrenciaEvento,
          as: 'recurrenciaEvento',
          attributes: ['id', 'dia', 'hora', 'fecha_desde', 'fecha_hasta'],
        },
        {
          model: EstadoInstanciaEvento,
          as: 'estado',
          attributes: ['id', 'nombre'],
          required: false, // LEFT JOIN para incluir instancias sin estado
        },
      ],
    });
  }

  public async create(
    dto: CreateInstanciaEventoDto,
    transaction?: Transaction,
  ) {
    // Si no se proporciona estadoId, asignar estado ACTIVA por defecto
    if (!dto.estadoId) {
      const estadoActiva = await EstadoInstanciaEvento.findOne({
        where: { nombre: EstadoInstanciaEventoEnum.ACTIVA },
      });

      if (estadoActiva) {
        dto.estadoId = estadoActiva.id;
      } else {
        logger.warn(
          'No se encontró el estado ACTIVA, creando instancia sin estado',
        );
      }
    }

    return await InstanciaEvento.create(dto, { transaction });
  }

  public async bulkCreate(
    instancias: CreateInstanciaEventoDto[],
    transaction?: Transaction,
  ) {
    // Si no se proporciona estadoId, asignar estado ACTIVA por defecto
    const estadoActiva = await EstadoInstanciaEvento.findOne({
      where: { nombre: EstadoInstanciaEventoEnum.ACTIVA },
    });

    if (estadoActiva) {
      // Asignar estado ACTIVA a todas las instancias que no tengan estado
      const instanciasConEstado = instancias.map((instancia) => ({
        ...instancia,
        estadoId: instancia.estadoId || estadoActiva.id,
      }));

      return await InstanciaEvento.bulkCreate(instanciasConEstado, {
        transaction,
      });
    } else {
      logger.warn(
        'No se encontró el estado ACTIVA, creando instancias sin estado',
      );
      return await InstanciaEvento.bulkCreate(instancias, { transaction });
    }
  }

  public async update(
    id: number,
    dto: UpdateInstanciaEventoDto,
    transaction?: Transaction,
  ) {
    const instancia = await this.findOne(id, transaction);
    if (!instancia) throw errors.app.instancia_evento.not_found;

    return await instancia.update(dto, { transaction });
  }

  public async delete(id: number, transaction?: Transaction) {
    const instancia = await this.findOne(id, transaction);
    if (!instancia) throw errors.app.instancia_evento.not_found;

    return await instancia.destroy({ transaction });
  }

  /**
   * Suspende una instancia de evento cambiando su estado a SUSPENDIDA
   */
  public async suspenderInstancia(id: number, transaction?: Transaction) {
    const instancia = await this.findOne(id, transaction);
    if (!instancia) throw errors.app.instancia_evento.not_found;

    // Buscar el estado SUSPENDIDA por nombre
    const estadoSuspendida = await EstadoInstanciaEvento.findOne({
      where: { nombre: EstadoInstanciaEventoEnum.SUSPENDIDA },
    });

    if (!estadoSuspendida) {
      throw errors.app.instancia_evento.estado_not_found;
    }

    await instancia.update({ estadoId: estadoSuspendida.id }, { transaction });

    // Retornar la instancia actualizada con todas las relaciones
    return await this.findOne(id, transaction);
  }

  /**
   * Reactiva una instancia de evento cambiando su estado a ACTIVA
   */
  public async reactivarInstancia(id: number, transaction?: Transaction) {
    const instancia = await this.findOne(id, transaction);
    if (!instancia) throw errors.app.instancia_evento.not_found;

    // Buscar el estado ACTIVA por nombre
    const estadoActiva = await EstadoInstanciaEvento.findOne({
      where: { nombre: EstadoInstanciaEventoEnum.ACTIVA },
      transaction,
    });

    if (!estadoActiva) {
      throw errors.app.instancia_evento.estado_not_found;
    }

    await instancia.update({ estadoId: estadoActiva.id }, { transaction });

    // Retornar la instancia actualizada con todas las relaciones
    return await this.findOne(id, transaction);
  }

  public async obtenerReservasInstancia(instanciaId: number) {
    try {
      return Reserva.findAll({
        where: { instanciaEventoId: instanciaId },
        include: [
          {
            model: EstadoReserva,
            as: 'estados',
          },
          {
            model: Recorrido,
            as: 'recorrido',
            attributes: [], // Omitir todos los atributos del recorrido
            include: [
              {
                model: User,
                as: 'user',
                attributes: [
                  'id',
                  'nombre',
                  'apellido',
                  'email',
                  'validado',
                  'fecha_nacimiento',
                  'bodegaId',
                ],
              },
            ],
          },
        ],
      });
    } catch (error) {
      logger.error('Error al obtener las reservas de la instancia:', error);
      throw error;
    }
  }

  /**
   * Método principal para generar instancias de eventos automáticamente
   * basado en las recurrencias y la configuración de días máximos
   */
  public async generarInstanciasAutomaticamente(): Promise<{
    totalInstanciasCreadas: number;
  }> {
    const transaction = await sequelize.transaction();
    try {
      logger.info('Iniciando generación automática de instancias de eventos');

      // 1. Obtener la configuración de días máximos adelante
      const configuracionDias = await MaximosDiasAdelanteReserva.findOne({
        where: { deleted_at: null },
        order: [['created_at', 'DESC']],
      });

      if (!configuracionDias) {
        logger.error('No se encontró configuración de días máximos adelante');
        await transaction.rollback();
        throw errors.app.general.validation_error;
      }

      const diasMaximos = configuracionDias.valor;
      logger.info(`Días máximos configurados: ${diasMaximos}`);

      // 2. Obtener todos los eventos con recurrencias activas (solo recurrentes)
      const eventosConRecurrencias = await Evento.findAll({
        include: [
          {
            model: RecurrenciaEvento,
            as: 'recurrencias',
            where: {
              [Op.or]: [
                { fecha_hasta: { [Op.gt]: new Date() } },
                { fecha_hasta: null },
              ],
            },
            required: true, // INNER JOIN para solo eventos con recurrencias
          },
        ],
      });

      logger.info(
        `Encontrados ${eventosConRecurrencias.length} eventos recurrentes activos`,
      );

      let totalInstanciasCreadas = 0;

      // 3. Para cada evento recurrente, generar instancias según sus recurrencias
      for (const evento of eventosConRecurrencias) {
        try {
          const instanciasGeneradas =
            await this.generarInstanciasParaEventoRecurrente(
              {
                eventoId: evento.id,
                diasMaximos,
              },
              transaction,
            );
          totalInstanciasCreadas += instanciasGeneradas.totalInstanciasCreadas;
        } catch (error) {
          logger.error(
            `Error generando instancias para evento ${evento.id}:`,
            error,
          );
          // Continuar con el siguiente evento en caso de error
        }
      }

      await transaction.commit();
      logger.info(
        `Generación completada. Total de instancias creadas: ${totalInstanciasCreadas}`,
      );

      return { totalInstanciasCreadas };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error en generación automática de instancias:', error);
      throw error;
    }
  }

  /**
   * Determina si un evento es único o recurrente basándose en si tiene recurrencias
   * Un evento es único si NO tiene RecurrenciaEvento relacionadas
   */
  public async esEventoUnico(
    eventoId: number,
    transaction?: Transaction,
  ): Promise<boolean> {
    const evento = await Evento.findByPk(eventoId, {
      include: [
        {
          model: RecurrenciaEvento,
          as: 'recurrencias',
        },
      ],
      transaction,
    });

    if (!evento) {
      throw errors.app.evento.not_found;
    }

    return !evento.recurrencias || evento.recurrencias.length === 0;
  }

  /**
   * Genera instancias para eventos únicos desde las recurrencias del DTO
   * Para eventos únicos, NO se crean recurrencias en DB, solo instancias
   * Cada recurrencia del DTO debe tener fecha_unica
   */
  public async generarInstanciasDesdeDtoRecurrencias(
    dto: GenerarInstanciasDesdeDtoRecurrenciasDto,
    transaction?: Transaction,
  ): Promise<{ totalInstanciasCreadas: number }> {
    const useTransaction = transaction || (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      const evento = await Evento.findByPk(dto.eventoId, {
        transaction: useTransaction,
      });

      if (!evento) {
        throw errors.app.evento.not_found;
      }

      const fechaActual = new Date();
      let instanciasCreadas = 0;

      // Buscar el estado ACTIVA por nombre
      const estadoActiva = await EstadoInstanciaEvento.findOne({
        where: { nombre: EstadoInstanciaEventoEnum.ACTIVA },
        transaction: useTransaction,
      });

      if (!estadoActiva) {
        logger.warn('No se encontró el estado ACTIVA bd mal inicializada.');
        throw errors.app.instancia_evento.estado_not_found;
      }

      // Iterar sobre las recurrencias del DTO y crear una instancia para cada una
      for (const recurrencia of dto.recurrencias) {
        if (!recurrencia.fecha_unica) {
          logger.debug(
            `Recurrencia sin fecha_unica, saltando para evento ${evento.id}`,
          );
          continue;
        }

        // Usar fecha_unica directamente ya que ya incluye la fecha y hora completa
        const fechaEvento = new Date(recurrencia.fecha_unica);

        // Verificar que la fecha del evento esté en el futuro
        if (fechaEvento <= fechaActual) {
          logger.debug(
            `Evento único ${evento.nombre} ya pasó (${fechaEvento.toISOString()}) - NO SE CREA INSTANCIA`,
          );
          continue;
        }

        // Verificar si ya existe una instancia
        const instanciaExistente = await InstanciaEvento.findOne({
          where: {
            eventoId: evento.id,
            fecha: fechaEvento,
          },
          transaction: useTransaction,
        });

        if (instanciaExistente) {
          logger.debug(
            `Instancia única ya existe para evento ${evento.nombre} en ${fechaEvento.toISOString()}`,
          );
          continue;
        }

        // Crear la instancia sin recurrenciaEventoId (ya que no hay recurrencias en DB)
        await InstanciaEvento.create(
          {
            fecha: fechaEvento,
            eventoId: evento.id,
            recurrenciaEventoId: undefined,
            estadoId: estadoActiva.id,
          },
          { transaction: useTransaction },
        );

        instanciasCreadas++;
        logger.debug(
          `Instancia única creada para evento ${evento.nombre} en ${fechaEvento.toISOString()}`,
        );
      }

      if (shouldCommit) {
        await useTransaction.commit();
      }

      return { totalInstanciasCreadas: instanciasCreadas };
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      logger.error(
        `Error generando instancias desde DTO recurrencias para evento ${dto.eventoId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Genera instancias para una recurrencia específica
   */
  private async generarInstanciasParaRecurrencia(
    evento: Evento,
    recurrencia: RecurrenciaEvento,
    diasMaximos: number,
    transaction: Transaction,
  ) {
    const fechaActual = new Date();
    const fechaLimite = new Date();

    fechaLimite.setDate(fechaLimite.getDate() + diasMaximos);

    // Convertir el día de la semana a número (0 = Domingo, 1 = Lunes, etc.)
    const diaSemanaMap: { [key: string]: number } = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
    };

    const diaSemana = diaSemanaMap[recurrencia.dia];

    if (diaSemana === undefined) {
      logger.warn(`Día de semana no válido: ${recurrencia.dia}`);
      return 0;
    }

    // Extraer hora y minutos de la hora del evento
    const [hora, minutos] = recurrencia.hora.split(':').map(Number);

    // Usar fecha actual si fecha_desde está vacía o es anterior
    let fechaDesde = recurrencia.fecha_desde || new Date();
    if (fechaDesde < fechaActual) {
      fechaDesde = fechaActual;
    }

    // Para fecha_hasta, si es null significa tiempo ilimitado
    // Solo usamos el límite de días máximos
    const fechaHasta = recurrencia.fecha_hasta;

    // Iniciar desde la fecha más reciente entre: fecha actual o fecha_desde de la recurrencia
    let fechaInicio = new Date(
      Math.max(fechaActual.getTime(), fechaDesde.getTime()),
    );
    let instanciasCreadas = 0;

    // Buscar el próximo día de la semana que coincida
    while (fechaInicio.getDay() !== diaSemana) {
      fechaInicio = new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000);
    }

    // Ajustar la hora
    fechaInicio = new Date(fechaInicio);
    fechaInicio.setHours(hora, minutos, 0, 0);

    // Si la fecha ya pasó hoy, ir al próximo día de la semana
    if (fechaInicio <= fechaActual) {
      fechaInicio = new Date(fechaInicio.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    // Generar instancias hasta alcanzar el límite de días máximos
    // Si fecha_hasta es null, solo usar fechaLimite
    // Si fecha_hasta tiene valor, usar el mínimo entre fechaLimite y fecha_hasta
    const fechaFinal = fechaHasta
      ? new Date(Math.min(fechaLimite.getTime(), fechaHasta.getTime()))
      : fechaLimite;

    const estadoActiva = await EstadoInstanciaEvento.findOne({
      where: { nombre: EstadoInstanciaEventoEnum.ACTIVA },
    });

    if (!estadoActiva) {
      logger.warn('No se encontró el estado ACTIVA bd mal inicializada.');
      throw errors.app.instancia_evento.estado_not_found;
    }

    while (fechaInicio <= fechaFinal) {
      // Verificar que la fecha esté en el futuro
      if (fechaInicio <= fechaActual) {
        fechaInicio = new Date(fechaInicio.getTime() + 7 * 24 * 60 * 60 * 1000);
        continue;
      }

      // Verificar si ya existe una instancia para esta fecha y recurrencia
      const instanciaExistente = await InstanciaEvento.findOne({
        where: {
          eventoId: evento.id,
          recurrenciaEventoId: recurrencia.id,
          fecha: fechaInicio,
        },
        transaction,
      });

      if (instanciaExistente) {
        continue;
      }
      // Buscar el estado ACTIVA por nombre

      // Crear nueva instancia
      await InstanciaEvento.create(
        {
          fecha: fechaInicio,
          eventoId: evento.id,
          recurrenciaEventoId: recurrencia.id,
          estadoId: estadoActiva?.id,
        },
        { transaction },
      );

      instanciasCreadas++;
      logger.debug(
        `Instancia creada para evento ${evento.nombre} en ${fechaInicio.toISOString()}`,
      );

      // Ir al próximo día de la semana
      fechaInicio = new Date(fechaInicio.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return instanciasCreadas;
  }

  /**
   * Genera instancias para un evento recurrente basado en sus recurrencias
   * Solo puede ser usado para eventos recurrentes (que tienen RecurrenciaEvento)
   */
  public async generarInstanciasParaEventoRecurrente(
    dto: GenerarInstanciasParaEventoRecurrenteDto,
    transaction?: Transaction,
  ): Promise<{ totalInstanciasCreadas: number }> {
    const useTransaction = transaction || (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      // Verificar que es un evento recurrente
      const esUnico = await this.esEventoUnico(dto.eventoId, useTransaction);
      if (esUnico) {
        throw new Error(
          'Este método solo puede usarse para eventos recurrentes. Use generarInstanciasDesdeDtoRecurrencias para eventos únicos.',
        );
      }

      // Obtener días máximos si no se proporcionan
      let diasMaximos = dto.diasMaximos;
      if (!diasMaximos) {
        const configuracionDias = await MaximosDiasAdelanteReserva.findOne({
          where: { deleted_at: null },
          order: [['created_at', 'DESC']],
          transaction: useTransaction,
        });

        if (!configuracionDias) {
          throw errors.app.general.validation_error;
        }

        diasMaximos = configuracionDias.valor;
      }

      // Obtener el evento con sus recurrencias
      const evento = await Evento.findByPk(dto.eventoId, {
        include: [
          {
            model: RecurrenciaEvento,
            as: 'recurrencias',
            where: {
              [Op.or]: [
                // Recurrencias con fecha_hasta en el futuro
                { fecha_hasta: { [Op.gt]: new Date() } },
                // Recurrencias sin fecha_hasta (tiempo ilimitado)
                { fecha_hasta: null },
              ],
            },
            required: true,
          },
        ],
        transaction: useTransaction,
      });

      if (!evento) {
        throw errors.app.evento.not_found;
      }

      if (!evento.recurrencias || evento.recurrencias.length === 0) {
        throw errors.app.evento.recurrencias_required;
      }

      let instanciasCreadas = 0;

      // Generar instancias para cada recurrencia
      for (const recurrencia of evento.recurrencias) {
        const instanciasGeneradas = await this.generarInstanciasParaRecurrencia(
          evento,
          recurrencia,
          diasMaximos,
          useTransaction,
        );
        instanciasCreadas += instanciasGeneradas;
      }

      if (shouldCommit) {
        await useTransaction.commit();
      }

      return { totalInstanciasCreadas: instanciasCreadas };
    } catch (error) {
      if (shouldCommit) {
        await useTransaction.rollback();
      }
      throw error;
    }
  }

  private generateWhereConditions(params: FindAllParams): WhereOptions {
    const where: WhereOptions = {};

    if (params.eventoId) {
      where.eventoId = params.eventoId;
    }

    if (params.recurrenciaEventoId) {
      where.recurrenciaEventoId = params.recurrenciaEventoId;
    }

    if (params.estadoId) {
      where.estadoId = params.estadoId;
    }

    if (params.fechaDesde || params.fechaHasta) {
      where.fecha = {};

      if (params.fechaDesde) {
        where.fecha[Op.gte] = params.fechaDesde;
      }

      if (params.fechaHasta) {
        where.fecha[Op.lte] = params.fechaHasta;
      }
    }

    return where;
  }
}

export const instanciaEventoService = new InstanciaEventoService();
