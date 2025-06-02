import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration.
 *
 * *Dont override the values at runtime, use the .env file*
 */
export default {
  PORT: process.env.PORT || 5000,
  API_VERSION: process.env.API_VERSION || 'v1',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  IS_TRACING_ENABLED: process.env.IS_TRACING_ENABLED === 'true' || false,
  DB_USER: process.env.DB_USER || 'user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'pass',
  DB_NAME: process.env.DB_NAME || 'db',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  IS_AUDIT_DISABLED: process.env.IS_AUDIT_DISABLED === 'true' || false,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
};
