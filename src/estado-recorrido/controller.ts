import { IEstadoRecorridoService } from './service';
import type { Request, Response } from 'express';
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
  }

  public getAll(_req: Request, res: Response) {
    this.estadoRecorridoService.findAll().then((data) => res.json(data));
  }
  public getOne(req: Request, res: Response) {
    this.estadoRecorridoService
      .findOne(+req.params.id)
      .then((data) => res.json(data));
  }
  public create(req: Request, res: Response) {
    createEstadoRecorridoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoRecorridoService.create(dto).then((data) => res.json(data)),
      );
  }
  public update(req: Request, res: Response) {
    updateEstadoRecorridoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoRecorridoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      );
  }
  public delete(req: Request, res: Response) {
    this.estadoRecorridoService
      .delete(+req.params.id)
      .then((data) => res.json(data));
  }
}
