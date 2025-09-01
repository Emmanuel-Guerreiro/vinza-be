import logger from '@/logger';
import { CronJob } from 'cron';
import { instanciaEventoService } from '@/instancia-evento/service';

const dailyMaintenanceJob = new CronJob(
  '0 2 * * *',
  async () => {
    logger.info('Iniciando tarea de mantenimiento diario');

    // Tu lógica aquí
    // Por ejemplo: limpiar logs antiguos, actualizar estadísticas, etc.

    logger.info('Tarea de mantenimiento diario completada');
  },
  null, // onComplete callback
  true, // start immediately
  'America/Argentina/Buenos_Aires', // timezone de Argentina
);

const generarInstanciasEventoJob = new CronJob(
  '0 1 * * *', // Ejecutar todos los días a la 1:00 AM
  async () => {
    logger.info('Iniciando generación automática de instancias de eventos');

    const resultado =
      await instanciaEventoService.generarInstanciasAutomaticamente();

    if (resultado) {
      logger.info(
        `Generación completada. Total de instancias creadas: ${resultado.totalInstanciasCreadas}`,
      );
    } else {
      logger.info('No se generaron nuevas instancias');
    }
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
  logger.info('Cron jobs inicializados correctamente');
}

export { dailyMaintenanceJob, generarInstanciasEventoJob };
