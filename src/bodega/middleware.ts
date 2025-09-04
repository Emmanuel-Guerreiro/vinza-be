import { errors } from '@/error';
import { usersService } from '@/users/service';
import { NextFunction, Request, Response } from 'express';

export async function uniqueBodegaPerUserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const userId = req.user;
  if (!userId) {
    return next(errors.app.general.not_found);
  }
  const user = await usersService.findWithBodega(userId);
  if (user?.bodega) {
    return next(errors.app.bodega.bodega_already_exists);
  }
  return next();
}
