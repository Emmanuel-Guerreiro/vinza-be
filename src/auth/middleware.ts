import config from '@/config';
import { setContext } from '@/context';
import { errors } from '@/error';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtAuthPayload } from './types';

declare module 'express' {
  interface Request {
    user?: JwtAuthPayload['user'];
  }
}

export const authMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw errors.app.auth.unauthorized;
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);
  if (!decoded) {
    throw errors.app.auth.unauthorized;
  }
  req.user = (decoded as unknown as JwtAuthPayload).user;

  req.logger.debug(`Setting user context, ${req.user}`);
  // This context is used to log the user in the audit
  setContext('user', req.user);

  next();
};
