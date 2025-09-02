import { IValoracionService } from './service';
import type { Request, Response } from 'express';
import { createValoracionSchema, updateValoracionSchema } from './schema';

export class ValoracionController {
  readonly valoracionService;

  constructor(valoracionService: IValoracionService) {
    this.valoracionService = valoracionService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getAverageByEvento = this.getAverageByEvento.bind(this);
  }

  public getAll(_req: Request, res: Response) {
    this.valoracionService.findAll().then((data) => res.json(data));
  }

  public getOne(req: Request, res: Response) {
    this.valoracionService
      .findOne(+req.params.id)
      .then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createValoracionSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.valoracionService
          .create({ ...dto, userId: req.user! })
          .then((data) => res.json(data)),
      );
  }

  public update(req: Request, res: Response) {
    updateValoracionSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.valoracionService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      );
  }

  public delete(req: Request, res: Response) {
    this.valoracionService
      .delete(+req.params.id)
      .then((data) => res.json(data));
  }

  public getAverageByEvento(req: Request, res: Response) {
    this.valoracionService
      .getAverageByEvento(+req.params.eventoId)
      .then((avg) => res.json({ avg }));
  }
}
