import type { Request, Response, NextFunction } from 'express';
import { createValoracionSchema } from './schema';
import { IValoracionService } from './service';

export class ValoracionController {
  readonly valoracionService;

  constructor(valoracionService: IValoracionService) {
    this.valoracionService = valoracionService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.delete = this.delete.bind(this);
    this.getAverageByEvento = this.getAverageByEvento.bind(this);
  }

  public getAll(_req: Request, res: Response, next: NextFunction) {
    this.valoracionService
      .findAll()
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.valoracionService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createValoracionSchema
      .parseAsync({ ...req.body, userId: req.user! })
      .then((dto) =>
        this.valoracionService.create(dto).then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.valoracionService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public getAverageByEvento(req: Request, res: Response, next: NextFunction) {
    this.valoracionService
      .getAverageByEvento(+req.params.eventoId)
      .then((avg) => res.json({ avg }))
      .catch((error) => next(error));
  }
}
