import { IBodegaService } from './service';
import type { Request, Response } from 'express';
import { createBodegaSchema, UpdateBodegaSchema } from './schema';

export class BodegaController {
  readonly bodegaService;

  constructor(bodegaService: IBodegaService) {
    this.bodegaService = bodegaService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getAll(_req: Request, res: Response) {
    this.bodegaService.findAll().then((data) => res.json(data));
  }

  public getOne(req: Request, res: Response) {
    this.bodegaService.findOne(+req.params.id).then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createBodegaSchema
      .parseAsync(req.body)
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
}
