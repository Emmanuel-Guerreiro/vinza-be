import type { NextFunction, Request, Response } from 'express';
import {
  createReservaSchema,
  reservaFilterSchema,
  updateReservaSchema,
} from './schema';
import { IReservaService } from './service';

export class ReservaController {
  readonly reservaService;

  constructor(reservaService: IReservaService) {
    this.reservaService = reservaService;
    this.getAll = this.getAll.bind(this);
    this.getMiBodega = this.getMiBodega.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getAll(req: Request, res: Response, next: NextFunction) {
    reservaFilterSchema
      .parseAsync(req.query)
      .then((filter) =>
        this.reservaService
          .findAll(filter)
          .then((data) => res.json(data))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  public getMiBodega(req: Request, res: Response, next: NextFunction) {
    reservaFilterSchema
      .parseAsync(req.query)
      .then((filter) =>
        this.reservaService
          .findAll(filter, req.bodegaId)
          .then((data) => res.json(data))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.reservaService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createReservaSchema
      .parseAsync({ ...req.body, userId: req.user })
      .then((dto) =>
        this.reservaService
          .create(dto)
          .then((data) => res.json(data))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    updateReservaSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.reservaService
          .update(+req.params.id, dto)
          .then((data) => res.json(data))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.reservaService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }
}
