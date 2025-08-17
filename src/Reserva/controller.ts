import type { Request, Response } from 'express';
import { createReservaSchema, updateReservaSchema } from './schema';
import { IReservaService } from './service';

export class ReservaController {
  readonly reservaService;

  constructor(reservaService: IReservaService) {
    this.reservaService = reservaService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }
  public getAll(req: Request, res: Response) {
    this.reservaService.findAll().then((data) => res.json(data));
  }
  public getOne(req: Request, res: Response) {
    this.reservaService.findOne(+req.params.id).then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createReservaSchema.parseAsync(req.body).then((dto) =>
      this.reservaService
        .create(dto)
        .then((data) => res.json(data))
        .catch((err) => res.json(err)),
    );
  }

  public update(req: Request, res: Response) {
    updateReservaSchema.parseAsync(req.body).then((dto) =>
      this.reservaService
        .update(+req.params.id, dto)
        .then((data) => res.json(data))
        .catch((err) => res.json(err)),
    );
  }

  public delete(req: Request, res: Response) {
    this.reservaService.delete(+req.params.id).then((data) => res.json(data));
  }
}
