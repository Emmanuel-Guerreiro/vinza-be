import logger from '@/logger';
import { CronJob } from 'cron';
import { instanciaEventoService } from '@/instancia-evento/service';
import { notificacionService } from '@/notificacion/service';

const dailyMaintenanceJob = new CronJob(
  '0 2 * * *',
  () => {
    logger.info('Iniciando tarea de mantenimiento diario');

    // Tu lógica aquí
    // Por ejemplo: limpiar logs antiguos, actualizar estadísticas, etc.
    Promise.resolve()
      .then(() => {
        // Aquí iría tu lógica de mantenimiento
        logger.info('Tarea de mantenimiento diario completada');
      })
      .catch((error) => {
        logger.error('Error en tarea de mantenimiento diario:', error);
        logger.error(error);
      });
  },
  null, // onComplete callback
  true, // start immediately
  'America/Argentina/Buenos_Aires', // timezone de Argentina
);

const generarInstanciasEventoJob = new CronJob(
  '0 1 * * *', // Ejecutar todos los días a la 1:00 AM
  () => {
    logger.info('Iniciando generación automática de instancias de eventos');

    instanciaEventoService
      .generarInstanciasAutomaticamente()
      .then((resultado) => {
        if (resultado) {
          logger.info(
            `Generación completada. Total de instancias creadas: ${resultado.totalInstanciasCreadas}`,
          );
        } else {
          logger.info('No se generaron nuevas instancias');
        }
      })
      .catch((error) => {
        logger.error('Error en generación automática de instancias:', error);
        logger.error(error);
      });
  },
  null, // onComplete callback
  true, // start immediately
  'America/Argentina/Buenos_Aires', // timezone de Argentina
);

const sendPunctuationNotificationsJob = new CronJob(
  '*/5 * * * *', // Ejecutar cada 5 minutos
  () => {
    logger.info('Iniciando envío de notificaciones de puntuación');

    notificacionService
      .sendPunctuationNotifications()
      .then((resultado) => {
        if (resultado) {
          logger.info(
            `Notificaciones de puntuación enviadas. Total creadas: ${resultado.notificationsCreated}`,
          );
        } else {
          logger.info('No se crearon nuevas notificaciones de puntuación');
        }
      })
      .catch((error) => {
        logger.error('Error en envío de notificaciones de puntuación:', error);
        logger.error(error);
      });
  },
  null, // onComplete callback
  true, // start immediately
  'America/Argentina/Buenos_Aires', // timezone de Argentina
);

// Función para inicializar todos los cron jobs
export function initializeCronJobs() {
  logger.info('Inicializando cron jobs...');

  // Iniciar los jobs
  dailyMaintenanceJob.start();
  generarInstanciasEventoJob.start();
  sendPunctuationNotificationsJob.start();
  logger.info('Cron jobs inicializados correctamente');
}

export {
  dailyMaintenanceJob,
  generarInstanciasEventoJob,
  sendPunctuationNotificationsJob,
};
