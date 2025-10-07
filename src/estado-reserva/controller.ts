import { IEstadoReservaService } from './service';
import type { Request, Response, NextFunction } from 'express';
import { createEstadoReservaSchema, updateEstadoReservaSchema } from './schema';
import { paginationSchema } from '@/pagination/schemas';

export class EstadoReservaController {
  readonly estadoReservaService;

  constructor(estadoReservaService: IEstadoReservaService) {
    this.estadoReservaService = estadoReservaService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.canDelete = this.canDelete.bind(this);
  }

  public getAll(req: Request, res: Response, next: NextFunction) {
    paginationSchema
      .parseAsync(req.query)
      .then((query) => {
        this.estadoReservaService
          .findAll(query)
          .then((data) => res.json(data))
          .catch((error) => next(error));
      })
      .catch((error) => next(error));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.estadoReservaService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createEstadoReservaSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoReservaService.create(dto).then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    updateEstadoReservaSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoReservaService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.estadoReservaService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public canDelete(req: Request, res: Response, next: NextFunction) {
    this.estadoReservaService
      .canDelete(+req.params.id)
      .then((canDelete) => res.json({ canDelete }))
      .catch((error) => next(error));
  }
}
