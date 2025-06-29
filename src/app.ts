import './db';

import config from '@/config';
import { setupDocs } from '@/docs';
import { handleErrors } from '@/error/handler';
import cors from 'cors';
import express, { Router } from 'express';
import helmet from 'helmet';
import { injectLogger, logRequests } from './logger';
import { reqTracer } from './tracer';
import rolesRouter from './rbac/router';
import { sequelize } from './db';
import userRouter from './users/router';
import authRouter from './auth/router';
import eventoRouter from './evento/router';
import estadoEventoRouter from './estado-evento/router';
import sucursalRouter from './sucursal/router';
import bodegaRouter from './bodega/router';
import auditRouter from './audit/router';
import { contextMiddleware } from './context';
import valoracionRouter from './valoracion/router';
import maximosDiasAdelanteReservaRouter from './maximos-dias-adelante-reserva/router';

function initializeRouter() {
  const router = Router();

  // Append routes created at /<module>/router.ts
  router.use('/users', userRouter);
  router.use('/auth', authRouter);
  router.use('/rbac', rolesRouter);
  router.use('/eventos', eventoRouter);
  router.use('/estado-eventos', estadoEventoRouter);
  router.use('/sucursales', sucursalRouter);
  router.use('/bodegas', bodegaRouter);
  router.use('/audits', auditRouter);
  router.use('/valoraciones', valoracionRouter);
  router.use(
    '/maximos-dias-adelante-reserva',
    maximosDiasAdelanteReservaRouter,
  );
  return router;
}

export default async function () {
  await sequelize.sync({ alter: true, logging: false });
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Don't touch the order of these middlewares
  app.use(reqTracer);
  app.use(injectLogger);
  app.use(logRequests);
  app.use(contextMiddleware);

  app.use(`/api/${config.API_VERSION}`, initializeRouter());

  setupDocs(app);

  // Global error handler (should be after routes)
  handleErrors(app);

  return app;
}
