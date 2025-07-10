// TODO: Ejecutar 'npm install' primero para instalar las dependencias
import { CronJob } from 'cron';

// Tarea diaria de limpieza o mantenimiento
const dailyMaintenanceJob = new CronJob(
  '0 2 * * *', // Cada día a las 2:00 AM
  async () => {
    try {
      console.log('Iniciando tarea de mantenimiento diario');
      
      // Tu lógica aquí
      // Por ejemplo: limpiar logs antiguos, actualizar estadísticas, etc.
      
      console.log('Tarea de mantenimiento diario completada');
    } catch (error) {
      console.error('Error en tarea de mantenimiento diario:', error);
    }
  },
  null, // onComplete callback
  true, // start immediately
  'America/Argentina/Buenos_Aires' // timezone de Argentina
);

// Función para inicializar todos los cron jobs
export function initializeCronJobs() {
  console.log('Inicializando cron jobs...');
  
  // Iniciar el job
  dailyMaintenanceJob.start();
  
  console.log('Cron jobs inicializados correctamente');
}

export { dailyMaintenanceJob };