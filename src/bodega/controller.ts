import { IBodegaService } from './service';
import type { Request, Response, NextFunction } from 'express';
import {
  createBodegaSchema,
  findAllParamsSchema,
  UpdateBodegaSchema,
  validateBodegaSchema,
} from './schema';

export class BodegaController {
  readonly bodegaService;

  constructor(bodegaService: IBodegaService) {
    this.bodegaService = bodegaService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.validate = this.validate.bind(this);
  }

  public getAll(req: Request, res: Response, next: NextFunction) {
    findAllParamsSchema
      .parseAsync(req.query)
      .then((query) => {
        this.bodegaService
          .findAll(query)
          .then((data) => res.json(data))
          .catch((error) => next(error));
      })
      .catch((error) => next(error));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.bodegaService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createBodegaSchema
      .parseAsync({ ...req.body, firstUserId: req.user })
      .then((dto) =>
        this.bodegaService.create(dto).then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    UpdateBodegaSchema.parseAsync(req.body)
      .then((dto) =>
        this.bodegaService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.bodegaService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public validate(req: Request, res: Response, next: NextFunction) {
    validateBodegaSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.bodegaService
          .validate(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }
}
