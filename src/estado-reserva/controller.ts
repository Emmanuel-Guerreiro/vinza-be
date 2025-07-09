import { IEstadoReservaService } from './service';
import type { Request, Response } from 'express';
import { createEstadoReservaSchema, updateEstadoReservaSchema } from './schema';

export class EstadoReservaController {
  readonly estadoReservaService;

  constructor(estadoReservaService: IEstadoReservaService) {
    this.estadoReservaService = estadoReservaService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getAll(_req: Request, res: Response) {
    this.estadoReservaService.findAll().then((data) => res.json(data));
  }

  public getOne(req: Request, res: Response) {
    this.estadoReservaService
      .findOne(+req.params.id)
      .then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createEstadoReservaSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoReservaService.create(dto).then((data) => res.json(data)),
      );
  }

  public update(req: Request, res: Response) {
    updateEstadoReservaSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoReservaService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      );
  }

  public delete(req: Request, res: Response) {
    this.estadoReservaService
      .delete(+req.params.id)
      .then((data) => res.json(data));
  }
}
