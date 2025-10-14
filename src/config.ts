import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration.
 *
 * *Dont override the values at runtime, use the .env file*
 */
export default {
  PORT: process.env.SERVER_PORT || 5000,
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
  SMTP_USER: process.env.SMTP_USER || 'user',
  SMTP_PASS: process.env.SMTP_PASS || 'pass',
  SMTP_FROM: process.env.SMTP_FROM || 'no-reply@example.com',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'vinza-media-bucket',
};
