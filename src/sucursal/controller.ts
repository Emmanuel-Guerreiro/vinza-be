import { ISucursalService } from './service';
import type { Request, Response } from 'express';
import { createSucursalSchema, updateSucursalSchema } from './schema';

export class SucursalController {
  readonly sucursalService;

  constructor(sucursalService: ISucursalService) {
    this.sucursalService = sucursalService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getAll(_req: Request, res: Response) {
    this.sucursalService.findAll().then((data) => res.json(data));
  }

  public getOne(req: Request, res: Response) {
    this.sucursalService.findOne(+req.params.id).then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createSucursalSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.sucursalService.create(dto).then((data) => res.json(data)),
      );
  }

  public update(req: Request, res: Response) {
    updateSucursalSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.sucursalService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      );
  }

  public delete(req: Request, res: Response) {
    this.sucursalService.delete(+req.params.id).then((data) => res.json(data));
  }
}
