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
} from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';

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

      // 2. Obtener todos los eventos con recurrencias activas
      const eventosConRecurrencias = await Evento.findAll({
        include: [
          {
            model: RecurrenciaEvento,
            as: 'recurrencias',
            where: {
              fecha_hasta: { [Op.gt]: new Date() },
            },
            required: true, // INNER JOIN para solo eventos con recurrencias
          },
        ],
      });

      logger.info(
        `Encontrados ${eventosConRecurrencias.length} eventos con recurrencias activas`,
      );

      let totalInstanciasCreadas = 0;

      // 3. Para cada evento, generar instancias según sus recurrencias
      for (const evento of eventosConRecurrencias) {
        try {
          const instanciasGeneradas = await this.generarInstanciasParaEvento(
            evento.id,
            diasMaximos,
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
   * Genera una instancia única para un evento con fecha específica
   * Para eventos únicos, fecha_desde y fecha_hasta son la misma
   */
  private async generarInstanciaUnica(
    evento: Evento,
    recurrencia: RecurrenciaEvento,
    diasMaximos: number,
    transaction: Transaction,
  ): Promise<boolean> {
    try {
      // Verificar que la recurrencia sea válida
      if (!recurrencia) {
        logger.debug(`Evento ${evento.nombre} no tiene recurrencia válida`);
        return false;
      }

      // Usar fecha actual si fecha_desde está vacía o es anterior
      let fechaDesde = recurrencia.fecha_desde || new Date();
      const fechaActual = new Date();

      if (fechaDesde < fechaActual) {
        fechaDesde = fechaActual;
      }

      // Crear la fecha del evento combinando fecha_desde con la hora
      const fechaEvento = new Date(fechaDesde);
      fechaEvento.setHours(
        parseInt(recurrencia.hora.split(':')[0]),
        parseInt(recurrencia.hora.split(':')[1]),
        0,
        0,
      );

      // Verificar que la fecha del evento esté en el futuro
      if (fechaEvento <= fechaActual) {
        logger.debug(
          `Evento único ${evento.nombre} ya pasó (${fechaEvento.toISOString()})`,
        );
        return false;
      }

      // Solo crear instancia si está dentro del rango de días máximos
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + diasMaximos);

      if (fechaEvento > fechaLimite) {
        logger.debug(
          `Evento único ${evento.nombre} está fuera del rango de días máximos`,
        );
        return false;
      }

      // Verificar si ya existe una instancia
      const instanciaExistente = await InstanciaEvento.findOne({
        where: {
          eventoId: evento.id,
          fecha: fechaEvento,
        },
        transaction,
      });

      if (instanciaExistente) {
        logger.debug(
          `Instancia única ya existe para evento ${evento.nombre} en ${fechaEvento.toISOString()}`,
        );
        return false;
      }

      // Buscar el estado ACTIVA por nombre
      const estadoActiva = await EstadoInstanciaEvento.findOne({
        where: { nombre: EstadoInstanciaEventoEnum.ACTIVA },
      });

      if (!estadoActiva) {
        logger.warn(
          'No se encontró el estado ACTIVA, creando instancia sin estado',
        );
      }

      // Crear la instancia única
      await InstanciaEvento.create(
        {
          fecha: fechaEvento,
          eventoId: evento.id,
          recurrenciaEventoId: recurrencia.id,
          estadoId: estadoActiva?.id,
        },
        { transaction },
      );

      logger.debug(
        `Instancia única creada para evento ${evento.nombre} en ${fechaEvento.toISOString()}`,
      );
      return true;
    } catch (error) {
      logger.error(
        `Error generando instancia única para evento ${evento.nombre}:`,
        error,
      );
      return false;
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

      if (!instanciaExistente) {
        // Buscar el estado ACTIVA por nombre
        const estadoActiva = await EstadoInstanciaEvento.findOne({
          where: { nombre: EstadoInstanciaEventoEnum.ACTIVA },
        });

        if (!estadoActiva) {
          logger.warn(
            'No se encontró el estado ACTIVA, creando instancia sin estado',
          );
        }

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
      }

      // Ir al próximo día de la semana
      fechaInicio = new Date(fechaInicio.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return instanciasCreadas;
  }

  /**
   * Genera instancias para un evento específico basado en sus recurrencias
   * Método unificado que maneja tanto eventos únicos como recurrentes
   */
  public async generarInstanciasParaEvento(
    eventoId: number,
    diasMaximos?: number,
    transaction?: Transaction,
  ): Promise<{ totalInstanciasCreadas: number }> {
    // Si no se proporciona transacción, crear una nueva
    const useTransaction = transaction || (await sequelize.transaction());
    const shouldCommit = !transaction;

    try {
      // Si no se proporcionan días máximos, obtener la configuración
      if (!diasMaximos) {
        const configuracionDias = await MaximosDiasAdelanteReserva.findOne({
          where: { deleted_at: null },
          order: [['created_at', 'DESC']],
        });

        if (!configuracionDias) {
          throw errors.app.general.validation_error;
        }

        diasMaximos = configuracionDias.valor;
      }

      // Obtener el evento con sus recurrencias
      const evento = await Evento.findByPk(eventoId, {
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

      for (const recurrencia of evento.recurrencias) {
        // Verificar si es un evento único (fecha_desde = fecha_hasta y ambas no son null)
        const esEventoUnico =
          recurrencia.fecha_desde !== null &&
          recurrencia.fecha_hasta !== null &&
          recurrencia.fecha_desde.getTime() ===
            recurrencia.fecha_hasta.getTime();

        if (esEventoUnico) {
          // Evento único - crear una sola instancia
          const instanciaCreada = await this.generarInstanciaUnica(
            evento,
            recurrencia,
            diasMaximos,
            useTransaction,
          );
          if (instanciaCreada) instanciasCreadas++;
        } else {
          // Evento recurrente - generar múltiples instancias según el patrón
          const instanciasGeneradas =
            await this.generarInstanciasParaRecurrencia(
              evento,
              recurrencia,
              diasMaximos,
              useTransaction,
            );
          instanciasCreadas += instanciasGeneradas;
        }
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
