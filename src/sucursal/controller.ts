import { ISucursalService } from './service';
import type { Request, Response, NextFunction } from 'express';
import { createSucursalSchema, updateSucursalSchema } from './schema';

export class SucursalController {
  readonly sucursalService;

  constructor(sucursalService: ISucursalService) {
    this.sucursalService = sucursalService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getAllByBodega = this.getAllByBodega.bind(this);
    this.canDelete = this.canDelete.bind(this);
  }

  public getAll(_req: Request, res: Response, next: NextFunction) {
    this.sucursalService
      .findAll()
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.sucursalService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createSucursalSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.sucursalService
          .create(dto)
          .then((data) => res.json(data))
          .catch((error) => next(error)),
      )
      .catch((error) => next(error));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    updateSucursalSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.sucursalService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.sucursalService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public getAllByBodega(req: Request, res: Response) {
    // Filtrar por la bodega del usuario autenticado
    if (typeof req.bodegaId !== 'undefined' && req.bodegaId !== null) {
      this.sucursalService
        .findAllByBodega(req.bodegaId)
        .then((data) => res.json(data));
    } else {
      res.json([]);
    }
  }

  public canDelete(req: Request, res: Response, next: NextFunction) {
    this.sucursalService
      .canDelete(+req.params.id)
      .then((canDelete) => res.json({ canDelete }))
      .catch((error) => next(error));
  }
}
