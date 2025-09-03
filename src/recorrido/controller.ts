import { IRecorridoService } from '@/recorrido/service';
import type { NextFunction, Request, Response } from 'express';
import {
  createRecorridoSchema,
  findAllRecorridosParamsSchema,
  updateRecorridoSchema,
} from './schema';
import { errors } from '@/error';
export class RecorridoController {
  readonly recorridoService;
  constructor(recorridoService: IRecorridoService) {
    this.recorridoService = recorridoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.confirmar = this.confirmar.bind(this);
  }

  public getAll(_req: Request, res: Response, next: NextFunction) {
    findAllRecorridosParamsSchema
      .parseAsync({ ..._req.query, userId: _req.user }) // Always force to use the one from the token
      .then((params) => {
        this.recorridoService
          .findAll(params)
          .then((data) => res.json(data))
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.recorridoService
      .findById(+req.params.id)
      .then((data) => {
        if (!data) {
          return res.json(data);
        }
        if (data.userId !== req.user) {
          next(errors.app.recorrido.not_found);
        }
        res.json(data);
      })
      .catch((err) => {
        next(err);
      });
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createRecorridoSchema
      .parseAsync({ userId: req.user })
      .then((dto) =>
        this.recorridoService
          .create(dto)
          .then((data) => res.json(data))
          .catch((err) => {
            next(err);
          }),
      )
      .catch((err) => {
        next(err);
      });
  }

  public update(req: Request, res: Response, next: NextFunction) {
    updateRecorridoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.recorridoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data))
          .catch((err) => {
            next(err);
          }),
      )
      .catch((err) => {
        next(err);
      });
  }

  public delete(req: Request, res: Response) {
    this.recorridoService.delete(+req.params.id).then((data) => res.json(data));
  }

  public confirmar(req: Request, res: Response, next: NextFunction) {
    this.recorridoService
      .confirmarRecorrido(+req.params.id)
      .then((data) => res.json(data))
      .catch((err) => {
        next(err);
      });
  }
}
