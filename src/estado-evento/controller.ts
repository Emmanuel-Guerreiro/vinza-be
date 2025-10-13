import { IEstadoEventoService } from './service';
import type { Request, Response, NextFunction } from 'express';
import { createEstadoEventoSchema, updateEstadoEventoSchema } from './schema';

export class EstadoEventoController {
  readonly estadoEventoService;

  constructor(estadoEventoService: IEstadoEventoService) {
    this.estadoEventoService = estadoEventoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.canDelete = this.canDelete.bind(this);
  }

  public getAll(_req: Request, res: Response, next: NextFunction) {
    this.estadoEventoService
      .findAll()
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.estadoEventoService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createEstadoEventoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoEventoService.create(dto).then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    updateEstadoEventoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoEventoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.estadoEventoService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public canDelete(req: Request, res: Response, next: NextFunction) {
    this.estadoEventoService
      .canDelete(+req.params.id)
      .then((canDelete) => res.json({ canDelete }))
      .catch((error) => next(error));
  }
}
