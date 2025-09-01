import { Request, Response, NextFunction } from 'express';
import { errors } from '@/error';
import { Evento } from './model';
import { Sucursal } from '@/sucursal/model';
import { Bodega } from '@/bodega/model';
import { InstanciaEvento } from '@/instancia-evento/model';

declare module 'express' {
  interface Request {
    evento?: Evento;
    instanciaEvento?: InstanciaEvento;
  }
}

export const eventoAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userBodegaId = req.user?.bodegaId;
  const eventoId = +req.params.id;

  if (!userBodegaId) {
    throw errors.app.evento.forbidden;
  }

  const evento = await Evento.findByPk(eventoId, {
    include: [
      {
        model: Sucursal,
        include: [{ model: Bodega }],
      },
    ],
  });

  if (!evento || evento.sucursal?.bodega?.id !== userBodegaId) {
    throw errors.app.evento.forbidden;
  }

  // Agregar el evento validado al request para reutilizar
  req.evento = evento;
  next();
};

export const sucursalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userBodegaId = req.user?.bodegaId;
  const sucursalId = req.body.sucursalId || +req.params.sucursalId;

  if (!userBodegaId) {
    throw errors.app.evento.sucursal_forbidden;
  }

  const sucursal = await Sucursal.findByPk(sucursalId, {
    include: [{ model: Bodega }],
  });

  if (!sucursal || sucursal.bodega?.id !== userBodegaId) {
    throw errors.app.evento.sucursal_forbidden;
  }

  next();
};

export const instanciaEventoAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userBodegaId = req.user?.bodegaId;
  const instanciaId = +req.params.instanciaId;

  if (!userBodegaId) {
    throw errors.app.evento.forbidden;
  }

  const instancia = await InstanciaEvento.findByPk(instanciaId, {
    include: [
      {
        model: Evento,
        include: [
          {
            model: Sucursal,
            include: [{ model: Bodega }],
          },
        ],
      },
    ],
  });

  if (!instancia || instancia.evento?.sucursal?.bodega?.id !== userBodegaId) {
    throw errors.app.evento.forbidden;
  }

  // Agregar la instancia validada al request para reutilizar
  req.instanciaEvento = instancia;
  next();
};
