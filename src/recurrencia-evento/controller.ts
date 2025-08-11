import type { Request, Response } from 'express';
import {
  createRecurrenciaEventoSchema,
  updateRecurrenciaEventoSchema,
  findAllRecurrenciaEventoParamsSchema,
  idParamSchema,
  createManyRecurrenciaEventoSchema,
} from './schema';
import { IRecurrenciaEventoService } from './service';

export class RecurrenciaEventoController {
  readonly recurrenciaEventoService;

  constructor(recurrenciaEventoService: IRecurrenciaEventoService) {
    this.recurrenciaEventoService = recurrenciaEventoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.createMany = this.createMany.bind(this);
  }

  public getAll(req: Request, res: Response) {
    findAllRecurrenciaEventoParamsSchema.parseAsync(req.query).then((query) => {
      this.recurrenciaEventoService.findAll(query.eventoId).then((data) => res.json(data));
    });
  }

  public getOne(req: Request, res: Response) {
    idParamSchema.parseAsync(req.params.id).then((id) => {
      this.recurrenciaEventoService.findById(id).then((data) => res.json(data));
    });
  }

  public create(req: Request, res: Response) {
    createRecurrenciaEventoSchema.parseAsync(req.body).then((dto) =>
      this.recurrenciaEventoService
        .create(dto)
        .then((data) => res.json(data))
        .catch((err) => res.json(err)),
    );
  }

  public update(req: Request, res: Response) {
    idParamSchema.parseAsync(req.params.id).then((id) => {
      updateRecurrenciaEventoSchema.parseAsync(req.body).then((dto) =>
        this.recurrenciaEventoService
          .update(id, dto)
          .then((data) => res.json(data))
          .catch((err) => res.json(err)),
      );
    });
  }

  public delete(req: Request, res: Response) {
    idParamSchema.parseAsync(req.params.id).then((id) => {
      this.recurrenciaEventoService.delete(id).then((data) => res.json(data));
    });
  }

  public createMany(req: Request, res: Response) {
    createManyRecurrenciaEventoSchema.parseAsync(req.body).then((validatedBody) => {
      Promise.all(
        validatedBody.recurrencias.map((recurrencia) => createRecurrenciaEventoSchema.parseAsync(recurrencia))
      ).then((validatedRecurrencias) =>
        this.recurrenciaEventoService
          .createMany(validatedRecurrencias)
          .then((data) => res.json(data))
          .catch((err) => res.json(err)),
      );
    });
  }
}

