import { IBodegaService } from './service';
import type { NextFunction, Request, Response } from 'express';
import {
  createBodegaWithMultimediaSchema,
  findAllParamsSchema,
  UpdateBodegaSchema,
  updateBodegaWithMultimediaSchema,
  validateBodegaSchema,
  bodegaMetricsSchema,
} from './schema';

export class BodegaController {
  readonly bodegaService;

  constructor(bodegaService: IBodegaService) {
    this.bodegaService = bodegaService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.updateWithMultimedia = this.updateWithMultimedia.bind(this);
    this.delete = this.delete.bind(this);
    this.validate = this.validate.bind(this);
    this.getMetrics = this.getMetrics.bind(this);
  }

  public getAll(req: Request, res: Response, next: NextFunction) {
    findAllParamsSchema
      .parseAsync(req.query)
      .then((query) => {
        this.bodegaService
          .findAll(query)
          .then((data) => res.json(data))
          .catch((error) => next(error));
      })
      .catch((error) => next(error));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.bodegaService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createBodegaWithMultimediaSchema.parse({
        ...req.body,
        firstUserId: req.user,
      });
      const files = req.files as Express.Multer.File[];
      // Create the bodega
      const bodega = await this.bodegaService.createWithMultimedia(
        dto,
        files ?? [],
      );
      res.json(bodega);
    } catch (err) {
      next(err);
    }
  }

  public update(req: Request, res: Response, next: NextFunction) {
    UpdateBodegaSchema.parseAsync(req.body)
      .then((dto) =>
        this.bodegaService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public async updateWithMultimedia(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const dto = updateBodegaWithMultimediaSchema.parse({
        ...req.body,
        // Parse JSON fields from form data
        deleteMultimedia: req.body.deleteMultimedia
          ? JSON.parse(req.body.deleteMultimedia)
          : undefined,
      });
      const files = req.files as Express.Multer.File[];
      // Update the bodega
      const bodega = await this.bodegaService.updateWithMultimedia(
        +req.params.id,
        dto,
        files ?? [],
      );
      res.json(bodega);
    } catch (err) {
      next(err);
    }
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.bodegaService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public validate(req: Request, res: Response, next: NextFunction) {
    validateBodegaSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.bodegaService
          .validate(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public getMetrics(req: Request, res: Response, next: NextFunction) {
    bodegaMetricsSchema
      .parseAsync(req.params)
      .then((params) =>
        this.bodegaService.getMetrics(params.id).then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }
}
