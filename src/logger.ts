import { createLogger, format, Logger, transports } from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import type { Request, Response, NextFunction } from 'express';
import config from './config';

const { combine, timestamp, printf, colorize } = format;

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getDateStr = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

const isProduction = process.env.LOG_MODE === 'production';

// Common format for all logs
const logFormat = printf(({ timestamp, level, message }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    // Console with colors
    new transports.Console({
      level: isProduction ? 'info' : 'debug',
      format: combine(
        colorize(), // Apply colors only for console
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat,
      ),
    }),

    // File logging (no colors)
    ...(isProduction
      ? [
          new transports.File({
            filename: path.join(logDir, `${getDateStr()}.log`),
            level: 'info',
            format: combine(
              timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              logFormat,
            ),
          }),
        ]
      : []),
  ],
});

export default logger;

declare global {
  // eslint-disable-next-line  @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /*
      Dont touch!!!


      This will extend the request type definition. 
      This methods are used to debug through the req lifecycle
      */
      trace_id: string;
      logger: {
        info: (msg: string) => Logger;
        error: (msg: string) => Logger;
        debug: (msg: string) => Logger;
      };
    }
  }
}

export function injectLogger(req: Request, _res: Response, next: NextFunction) {
  const formatMsg = (msg: string) =>
    `${config.IS_TRACING_ENABLED ? `[trace_id=${req.trace_id || 'no-trace'}]` : ''} [${req.method} ${req.originalUrl}] ${msg}`;
  req.logger = {
    info: (msg: string) => logger.info(formatMsg(msg)),
    error: (msg: string) => logger.error(formatMsg(msg)),
    debug: (msg: string) => logger.debug(formatMsg(msg)),
  };
  next();
}

const reqLog = (req: Request, res: Response) => {
  const start = Date.now();
  const duration = Date.now() - start;
  logger.info(
    `${res.statusCode} - ${config.IS_TRACING_ENABLED ? `[trace_id=${req.trace_id || 'no-trace'}]` : ''}[${req.method} ${req.originalUrl}] - ${duration}ms`,
  );
};
export function logRequests(req: Request, res: Response, next: NextFunction) {
  res.on('finish', () => reqLog(req, res));
  res.on('error', () => reqLog(req, res));
  // res.on('close', () => reqLog(req, res));
  next();
}
