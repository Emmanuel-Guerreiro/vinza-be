import { EstadoReservaEnum } from '@/estado-reserva/enum';
import { EstadoReserva } from '@/estado-reserva/model';
import { Evento } from '@/evento/model';
import { InstanciaEvento } from '@/instancia-evento/model';
import { MultimediaEventos } from '@/multimedia/model';
import { NotificacionDescartada } from './model';
import { CalificacionPendiente } from './types';
import { Reserva } from '@/reserva/model';
import { Recorrido } from '@/recorrido/model';
import { RecurrenciaEvento } from '@/evento/model';
import { Sucursal } from '@/sucursal/model';
import { Valoracion } from '@/valoracion/model';
import { Op } from 'sequelize';
import logger from '@/logger';

class NotificacionService {
  public async sendNotificationToUser(
    userId: number,
    titulo: string,
    descripcion: string,
    data?: Record<string, unknown>,
  ) {
    logger.info(`Sending notification to user ${userId}: ${titulo}`);
    return { success: true, userId, titulo, descripcion, data };
  }

  public async getCalificacionesPendientes(
    userId: number,
  ): Promise<CalificacionPendiente[]> {
    try {
      const ahora = new Date();

      const reservas = await Reserva.findAll({
        include: [
          {
            model: EstadoReserva,
            as: 'estados',
            where: { nombre: EstadoReservaEnum.CONFIRMADA },
            required: true,
          },
          {
            model: InstanciaEvento,
            as: 'instanciaEvento',
            where: {
              fecha: {
                [Op.lt]: ahora,
              },
            },
            required: true,
            include: [
              {
                model: Evento,
                as: 'evento',
                required: true,
                include: [
                  {
                    model: Sucursal,
                    as: 'sucursal',
                    required: true,
                  },
                  {
                    model: MultimediaEventos,
                    as: 'multimedia',
                    required: false,
                  },
                ],
              },
              {
                model: RecurrenciaEvento,
                as: 'recurrenciaEvento',
                required: false,
              },
            ],
          },
          {
            model: Recorrido,
            as: 'recorrido',
            where: { userId },
            required: true,
          },
        ],
      });

      const eventosYaCalificados = await Valoracion.findAll({
        where: { userId },
        attributes: ['eventoId'],
      });

      const eventosDescartados = await NotificacionDescartada.findAll({
        where: { usuarioId: userId },
        attributes: ['eventoId'],
      });

      const eventosCalificadosIds = new Set(
        eventosYaCalificados.map((v) => v.eventoId),
      );
      const eventosDescartadosIds = new Set(
        eventosDescartados.map((nd) => nd.eventoId),
      );

      const calificacionesPendientes: CalificacionPendiente[] = [];
      const eventosProcesados = new Set<number>();

      for (const reserva of reservas) {
        const evento = reserva.instanciaEvento?.evento;
        const instanciaEvento = reserva.instanciaEvento;
        const recurrenciaEvento = instanciaEvento?.recurrenciaEvento;
        const sucursal = evento?.sucursal;
        const todasMultimedia = evento?.multimedia || [];
        const multimediaPortada = todasMultimedia.find((m) => m.es_portada);
        const multimedia = multimediaPortada || todasMultimedia[0];

        if (!evento || !instanciaEvento || !sucursal) {
          continue;
        }

        const eventoId = evento.id;

        if (
          eventosProcesados.has(eventoId) ||
          eventosCalificadosIds.has(eventoId) ||
          eventosDescartadosIds.has(eventoId)
        ) {
          continue;
        }

        eventosProcesados.add(eventoId);

        const fechaEvento = new Date(instanciaEvento.fecha);

        let horaEvento = '';
        if (recurrenciaEvento?.hora) {
          horaEvento = recurrenciaEvento.hora;
        } else {
          const horas = fechaEvento.getHours().toString().padStart(2, '0');
          const minutos = fechaEvento.getMinutes().toString().padStart(2, '0');
          horaEvento = `${horas}:${minutos}`;
        }

        const imagenEvento = multimedia?.url || '';

        calificacionesPendientes.push({
          evento_id: eventoId,
          evento_nombre: evento.nombre,
          evento_fecha: fechaEvento,
          evento_hora: horaEvento,
          evento_lugar: sucursal.direccion,
          evento_descripcion: evento.descripcion,
          evento_imagen: imagenEvento,
        });
      }

      return calificacionesPendientes;
    } catch (error) {
      logger.error(
        `Error getting calificaciones pendientes for user ${userId}: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  public async descartarNotificacion(
    userId: number,
    eventoId: number,
  ): Promise<void> {
    try {
      await NotificacionDescartada.findOrCreate({
        where: {
          usuarioId: userId,
          eventoId: eventoId,
        },
        defaults: {
          usuarioId: userId,
          eventoId: eventoId,
        },
      });
    } catch (error) {
      logger.error(
        `Error discarding notification for user ${userId} and evento ${eventoId}: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }
}

export const notificacionService = new NotificacionService();
export type INotificacionService = typeof notificacionService;
