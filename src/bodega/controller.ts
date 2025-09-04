import { IBodegaService } from './service';
import type { NextFunction, Request, Response } from 'express';
import {
  createBodegaWithMultimediaSchema,
  findAllParamsSchema,
  UpdateBodegaSchema,
} from './schema';

export class BodegaController {
  readonly bodegaService;

  constructor(bodegaService: IBodegaService) {
    this.bodegaService = bodegaService;
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getAll(req: Request, res: Response) {
    findAllParamsSchema.parseAsync(req.query).then((query) => {
      this.bodegaService.findAll(query).then((data) => res.json(data));
    });
  }

  public getOne(req: Request, res: Response) {
    this.bodegaService.findOne(+req.params.id).then((data) => res.json(data));
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createBodegaWithMultimediaSchema.parse({
        ...req.body,
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

  public update(req: Request, res: Response) {
    UpdateBodegaSchema.parseAsync(req.body).then((dto) =>
      this.bodegaService
        .update(+req.params.id, dto)
        .then((data) => res.json(data)),
    );
  }

  public delete(req: Request, res: Response) {
    this.bodegaService.delete(+req.params.id).then((data) => res.json(data));
  }
}
