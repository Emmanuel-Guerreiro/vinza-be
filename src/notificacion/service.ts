import { EstadoReservaEnum } from '@/estado-reserva/enum';
import { EstadoReserva } from '@/estado-reserva/model';
import { InstanciaEvento } from '@/instancia-evento/model';
import logger from '@/logger';
import { Recorrido } from '@/recorrido/model';
import { Reserva } from '@/reserva/model';
import { User } from '@/users/model';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Op } from 'sequelize';
import { TipoNotificacionEnum } from './enum';
import { Notificacion, TipoNotificacion } from './model';

class NotificacionService {
  public async sendPunctuationNotifications() {
    try {
      dayjs.locale('es');

      const tipoPunctuation = await TipoNotificacion.findOne({
        where: { nombre: TipoNotificacionEnum.PUNCTUATION },
      });

      if (!tipoPunctuation) {
        logger.warn(
          'TipoNotificacion PUNCTUATION not found, skipping notification sending',
        );
        return;
      }

      const now = new Date();

      const reservasIdsWithNotifications = await Notificacion.findAll({
        attributes: ['reservaId'],
        where: {
          tipoNotificacionId: tipoPunctuation.id,
        },
        raw: true,
      }).then((notifications) =>
        notifications.map((n) => (n as { reservaId: number }).reservaId),
      );

      const reservas = await Reserva.findAll({
        where: {
          ...(reservasIdsWithNotifications.length > 0 && {
            id: {
              [Op.notIn]: reservasIdsWithNotifications,
            },
          }),
        },
        include: [
          {
            model: EstadoReserva,
            as: 'estados',
            required: true,
            where: { nombre: EstadoReservaEnum.CONFIRMADA },
          },
          {
            model: InstanciaEvento,
            as: 'instanciaEvento',
            required: true,
            where: {
              fecha: {
                [Op.lt]: now,
              },
            },
          },
          {
            model: Recorrido,
            as: 'recorrido',
            required: true,
            include: [
              {
                model: User,
                as: 'user',
                required: true,
              },
            ],
          },
        ],
      });

      const reservasWithoutNotification = reservas;

      logger.info(
        `Found ${reservasWithoutNotification.length} reservas that need punctuation notifications`,
      );

      const notificationsCreated = await Promise.all(
        reservasWithoutNotification.map(async (reserva) => {
          const user = reserva.recorrido?.user;
          if (!user) {
            logger.warn(
              `Reserva ${reserva.id} has no associated user, skipping`,
            );
            return null;
          }

          const fechaFormateada = dayjs(reserva.instanciaEvento.fecha).format(
            'DD/MM/YYYY',
          );

          const notification = await Notificacion.create({
            titulo: `Puntuar evento del ${fechaFormateada}`,
            descripcion:
              'Puntua tu experiencia en el evento al que acabas de recurrir',
            userId: user.id,
            tipoNotificacionId: tipoPunctuation.id,
            reservaId: reserva.id,
          });

          logger.info(
            `Created notification ${notification.id} for user ${user.id} and reserva ${reserva.id}`,
          );

          return notification;
        }),
      );

      ///  Agregar aca para enviar la notificacion a los usuarios

      const createdCount = notificationsCreated.filter(
        (n) => n !== null,
      ).length;
      logger.info(
        `Successfully created ${createdCount} punctuation notifications`,
      );

      return {
        notificationsCreated: createdCount,
      };
    } catch (error) {
      logger.error('Error sending punctuation notifications:', error);
      throw error;
    }
  }
}

export const notificacionService = new NotificacionService();
export type INotificacionService = typeof notificacionService;
