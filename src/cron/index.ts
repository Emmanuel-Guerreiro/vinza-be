import logger from '@/logger';
import { CronJob } from 'cron';

// Tarea diaria de limpieza o mantenimiento
const dailyMaintenanceJob = new CronJob(
  '0 2 * * *', // Cada día a las 2:00 AM
  async () => {
    try {
      logger.info('Iniciando tarea de mantenimiento diario');

      // Tu lógica aquí
      // Por ejemplo: limpiar logs antiguos, actualizar estadísticas, etc.

      logger.info('Tarea de mantenimiento diario completada');
    } catch (error) {
      logger.error('Error en tarea de mantenimiento diario:', error);
    }
  },
  null, // onComplete callback
  true, // start immediately
  'America/Argentina/Buenos_Aires', // timezone de Argentina
);

// Función para inicializar todos los cron jobs
export function initializeCronJobs() {
  logger.info('Inicializando cron jobs...');

  // Iniciar el job
  dailyMaintenanceJob.start();

  logger.info('Cron jobs inicializados correctamente');
}

export { dailyMaintenanceJob };
