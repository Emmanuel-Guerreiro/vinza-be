import { ICategoriaEventoService } from './service';
import type { NextFunction, Request, Response } from 'express';
import {
  createCategoriaEventoSchema,
  updateCategoriaEventoSchema,
} from './schema';

export class CategoriaEventoController {
  readonly categoriaEventoService;

  constructor(categoriaEventoService: ICategoriaEventoService) {
    this.categoriaEventoService = categoriaEventoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.canDelete = this.canDelete.bind(this);
  }

  public getAll(_req: Request, res: Response, next: NextFunction) {
    this.categoriaEventoService
      .findAll()
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.categoriaEventoService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createCategoriaEventoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.categoriaEventoService
          .create(dto)
          .then((data) => res.json(data))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    updateCategoriaEventoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.categoriaEventoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.categoriaEventoService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => next(err));
  }

  public canDelete(req: Request, res: Response, next: NextFunction) {
    this.categoriaEventoService
      .canDelete(+req.params.id)
      .then((canDelete) => res.json({ canDelete }))
      .catch((err) => next(err));
  }
}
