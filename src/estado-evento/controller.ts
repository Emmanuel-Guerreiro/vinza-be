import { IEstadoEventoService } from './service';
import type { Request, Response } from 'express';
import { createEstadoEventoSchema, updateEstadoEventoSchema } from './schema';

export class EstadoEventoController {
  readonly estadoEventoService;

  constructor(estadoEventoService: IEstadoEventoService) {
    this.estadoEventoService = estadoEventoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getAll(_req: Request, res: Response) {
    this.estadoEventoService
      .findAll()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => res.json(err));
  }

  public getOne(req: Request, res: Response) {
    this.estadoEventoService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
  }

  public create(req: Request, res: Response) {
    createEstadoEventoSchema
      .parseAsync(req.body)
      .then((dto) => {
        return this.estadoEventoService
          .create(dto)
          .then((data) => res.json(data))
          .catch((err) => res.json(err));
      })
      .catch((err) => res.status(400).json({ error: err.message }));
  }

  public update(req: Request, res: Response) {
    updateEstadoEventoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.estadoEventoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data))
          .catch((err) => res.json(err)),
      )
      .catch((err) => res.status(400).json({ error: err.message }));
  }

  public delete(req: Request, res: Response) {
    this.estadoEventoService
      .delete(+req.params.id)
      .then((data) => res.json(data));
  }
}
