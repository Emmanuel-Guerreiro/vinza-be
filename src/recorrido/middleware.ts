import { errors } from '@/error';
import { NextFunction, Request, Response } from 'express';
import { recorridoService } from './service';

export async function validateRecorrdidoOwnership(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  const userId = req.user;
  const recorrido = await recorridoService.findById(+id);
  if (!recorrido || recorrido.userId !== userId) {
    return next(errors.app.recorrido.not_found);
  }

  return next();
}
