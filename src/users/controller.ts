import { IUsersService } from '@/users/service';
import type { Request, Response, NextFunction } from 'express';
import { createUserSchema, UpdateUserSchema } from './schema';
export class UsersController {
  readonly usersService;

  constructor(usersService: IUsersService) {
    this.usersService = usersService;

    // Keep binding this to the methods to avoid problems with
    // the this reference inside callbacks
    this.getAll = this.getAll.bind(this);
    this.getAllByBodega = this.getAllByBodega.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getMe = this.getMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
  }

  public getAll(_req: Request, res: Response, next: NextFunction) {
    this.usersService
      .findAll()
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public getAllByBodega(req: Request, res: Response, next: NextFunction) {
    const bodegaId = req.bodegaId!;
    this.usersService
      .findAllByBodega(bodegaId)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public getOne(req: Request, res: Response, next: NextFunction) {
    this.usersService
      .findOne(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public create(req: Request, res: Response, next: NextFunction) {
    createUserSchema
      .parseAsync(req.body)
      .then((dto) => {
        // Agregar automáticamente el bodegaId del usuario autenticado
        const userData = {
          ...dto,
          bodegaId: req.bodegaId,
        };
        return this.usersService
          .create(userData)
          .then((data) => res.json(data));
      })
      .catch((error) => next(error));
  }

  public update(req: Request, res: Response, next: NextFunction) {
    UpdateUserSchema.parseAsync(req.body)
      .then((dto) =>
        this.usersService
          .update(+req.params.id, dto)
          .then((data) => res.json(data)),
      )
      .catch((error) => next(error));
  }

  public delete(req: Request, res: Response, next: NextFunction) {
    this.usersService
      .delete(+req.params.id)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public getMe(req: Request, res: Response, next: NextFunction) {
    this.usersService
      .findOne(req.user!)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }

  public updateMe(req: Request, res: Response, next: NextFunction) {
    const dto = UpdateUserSchema.parse(req.body);
    this.usersService
      .update(req.user!, dto)
      .then((data) => res.json(data))
      .catch((error) => next(error));
  }
}
