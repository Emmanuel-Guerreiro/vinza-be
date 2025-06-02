import { ICategoriaEventoService } from './service';
import type { Request, Response } from 'express';
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
  }

  public getAll(_req: Request, res: Response) {
    this.categoriaEventoService
      .findAll()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => res.json(err));
  }

  public getOne(req: Request, res: Response) {
    this.categoriaEventoService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
  }

  public create(req: Request, res: Response) {
    createCategoriaEventoSchema
      .parseAsync(req.body)
      .then((dto) => {
        return this.categoriaEventoService
          .create(dto)
          .then((data) => res.json(data))
          .catch((err) => res.json(err));
      })
      .catch((err) => res.status(400).json({ error: err.message }));
  }

  public update(req: Request, res: Response) {
    updateCategoriaEventoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.categoriaEventoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data))
          .catch((err) => res.json(err)),
      )
      .catch((err) => res.status(400).json({ error: err.message }));
  }

  public delete(req: Request, res: Response) {
    this.categoriaEventoService
      .delete(+req.params.id)
      .then((data) => res.json(data));
  }
}
