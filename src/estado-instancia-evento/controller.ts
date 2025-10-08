import { IEstadoInstanciaEventoService } from './service';
import type { Request, Response, NextFunction } from 'express';
import {
  createEstadoInstanciaEventoSchema,
  updateEstadoInstanciaEventoSchema,
} from './schema';
import { paginationSchema } from '@/pagination/schemas';

export class EstadoInstanciaEventoController {
  readonly estadoInstanciaEventoService;

  constructor(estadoInstanciaEventoService: IEstadoInstanciaEventoService) {
    this.estadoInstanciaEventoService = estadoInstanciaEventoService;
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
        this.estadoInstanciaEventoService
          .findAll(query)
          .then((data) => res.json(data))
          .catch((error) => next(error));
      })
      .catch((error) => next(error));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.estadoInstanciaEventoService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    const dto = createEstadoInstanciaEventoSchema.parse(req.body);
    this.estadoInstanciaEventoService
      .create(dto)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    const dto = updateEstadoInstanciaEventoSchema.parse(req.body);
    this.estadoInstanciaEventoService
      .update(+req.params.id, dto)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.estadoInstanciaEventoService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public canDelete(req: Request, res: Response, next: NextFunction) {
    this.estadoInstanciaEventoService
      .canDelete(+req.params.id)
      .then((canDelete) => res.json({ canDelete }))
      .catch((error) => next(error));
  }
}
