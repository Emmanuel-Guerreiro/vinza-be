import config from '@/config';
import { type Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import logger from './logger';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation for my app',
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}/api/${config.API_VERSION}`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/**/*router.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupDocs(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  logger.info(`Initialized docs at http://localhost:${config.PORT}/docs`);
}
