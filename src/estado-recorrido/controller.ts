import { IEstadoRecorridoService } from './service';
import type { Request, Response, NextFunction } from 'express';
import {
  createEstadoRecorridoSchema,
  updateEstadoRecorridoSchema,
} from './schema';

export class EstadoRecorridoController {
  readonly estadoRecorridoService;

  constructor(estadoRecorridoService: IEstadoRecorridoService) {
    this.estadoRecorridoService = estadoRecorridoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.canDelete = this.canDelete.bind(this);
  }

  public getAll(_req: Request, res: Response, next: NextFunction) {
    this.estadoRecorridoService
      .findAll()
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }
  public getOne(req: Request, res: Response, next: NextFunction) {
    this.estadoRecorridoService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }
  public create(req: Request, res: Response, next: NextFunction) {
    createEstadoRecorridoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoRecorridoService.create(dto).then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }
  public update(req: Request, res: Response, next: NextFunction) {
    updateEstadoRecorridoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoRecorridoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }
  public delete(req: Request, res: Response, next: NextFunction) {
    this.estadoRecorridoService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public canDelete(req: Request, res: Response, next: NextFunction) {
    this.estadoRecorridoService
      .canDelete(+req.params.id)
      .then((canDelete) => res.json({ canDelete }))
      .catch((error) => next(error));
  }
}
