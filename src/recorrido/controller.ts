import { IRecorridoService } from '@/recorrido/service';
import type { Request, Response } from 'express';
import { createRecorridoSchema, updateRecorridoSchema } from './schema';
export class RecorridoController {
  readonly recorridoService;
  constructor(recorridoService: IRecorridoService) {
    this.recorridoService = recorridoService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getAll(_req: Request, res: Response) {
    this.recorridoService.findAll().then((data) => res.json(data));
  }
  public getOne(req: Request, res: Response) {
    this.recorridoService
      .findById(+req.params.id)
      .then((data) => res.json(data));
  }
  public create(req: Request, res: Response) {
    const user = req.user;
    createRecorridoSchema
      .parseAsync({ ...req.body, userId: user })
      .then((dto) =>
        this.recorridoService.create(dto).then((data) => res.json(data)),
      );
  }
  public update(req: Request, res: Response) {
    updateRecorridoSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.recorridoService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      );
  }
  public delete(req: Request, res: Response) {
    this.recorridoService.delete(+req.params.id).then((data) => res.json(data));
  }
}
