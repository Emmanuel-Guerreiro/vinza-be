import initApp from '@/app';
import config from '@/config';
import 'dotenv/config';
import redisClient from './redis';
import { initializeCronJobs } from './cron';

async function server() {
  const app = await initApp();

  // Add here async initializations
  await redisClient.connect();
  initializeCronJobs();

  app.listen(config.PORT);
}

server();
