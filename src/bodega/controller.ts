import { IBodegaService } from './service';
import type { Request, Response } from 'express';
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

  public getAll(req: Request, res: Response) {
    findAllParamsSchema.parseAsync(req.query).then((query) => {
      this.bodegaService.findAll(query).then((data) => res.json(data));
    });
  }

  public getOne(req: Request, res: Response) {
    this.bodegaService.findOne(+req.params.id).then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createBodegaSchema
      .parseAsync({ ...req.body, firstUserId: req.user })
      .then((dto) =>
        this.bodegaService.create(dto).then((data) => res.json(data)),
      );
  }

  public update(req: Request, res: Response) {
    UpdateBodegaSchema.parseAsync(req.body).then((dto) =>
      this.bodegaService
        .update(+req.params.id, dto)
        .then((data) => res.json(data)),
    );
  }

  public delete(req: Request, res: Response) {
    this.bodegaService.delete(+req.params.id).then((data) => res.json(data));
  }

  public validate(req: Request, res: Response) {
    validateBodegaSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.bodegaService
          .validate(+req.params.id, dto)
          .then((data) => res.json(data)),
      );
  }
}
