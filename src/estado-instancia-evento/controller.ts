import { IEstadoInstanciaEventoService } from './service';
import type { Request, Response } from 'express';
import {
  createEstadoInstanciaEventoSchema,
  updateEstadoInstanciaEventoSchema,
} from './schema';

export class EstadoInstanciaEventoController {
  readonly estadoInstanciaEventoService;

  constructor(estadoInstanciaEventoService: IEstadoInstanciaEventoService) {
    this.estadoInstanciaEventoService = estadoInstanciaEventoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getAll(_req: Request, res: Response) {
    this.estadoInstanciaEventoService.findAll().then((data) => res.json(data));
  }

  public getOne(req: Request, res: Response) {
    this.estadoInstanciaEventoService
      .findOne(+req.params.id)
      .then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createEstadoInstanciaEventoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoInstanciaEventoService
          .create(dto)
          .then((data) => res.json(data)),
      );
  }

  public update(req: Request, res: Response) {
    updateEstadoInstanciaEventoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoInstanciaEventoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      );
  }

  public delete(req: Request, res: Response) {
    this.estadoInstanciaEventoService
      .delete(+req.params.id)
      .then((data) => res.json(data));
  }
}
