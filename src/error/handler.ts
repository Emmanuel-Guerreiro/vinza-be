import { errors } from '@/error';
import { IError } from '@/error/types';
import logger from '@/logger';
import { NextFunction, Response, Request, Express } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createGeneralError(err: any): IError {
  const baseError = errors.app.general.general_error;

  return {
    status: err?.status ?? baseError.status,
    key: err?.key ?? baseError.key,
    message: err?.message ?? baseError.message,
    message_eng: err?.message_eng ?? baseError.message_eng,
  };
}

function createZodError(zodError: ZodError): IError {
  const baseError = errors.app.general.validation_error;

  // Get the first validation error for a more specific message
  const firstError = zodError.errors[0];
  const fieldName = firstError?.path?.join('.') || 'unknown';

  return {
    status: baseError.status,
    key: baseError.key,
    message: `Error de validación en el campo '${fieldName}': ${firstError?.message || 'Campo inválido'}`,
    message_eng: `Validation error in field '${fieldName}': ${firstError?.message || 'Invalid field'}`,
  };
}

function handleUnhandledError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!err) next();

  // If the error is already in the correct format (has key, message, etc)
  if (err.key && err.message && err.message_eng && err.status) {
    res.status(err.status).json(err);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const zodError = createZodError(err);
    res.status(zodError.status).json(zodError);
    return;
  }

  const generalError = createGeneralError(err);
  res.status(generalError.status).json(generalError);
}

function handleNotFoundError(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  logger.error('Not found path');
  next(errors.app.general.not_found);
}

export function handleErrors(app: Express) {
  app.use(handleNotFoundError);
  app.use(handleUnhandledError);
}

process.on('unhandledRejection', (reason: unknown) => {
  // Forward the error to the Express error handler if possible
  // You might want to log the error to a logging service here
  // eslint-disable-next-line no-console
  console.error('Unhandled Promise Rejection:', reason);

  throw reason;
});
