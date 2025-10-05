import { IUsersService } from '@/users/service';
import type { Request, Response } from 'express';
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

  public getAll(_req: Request, res: Response) {
    this.usersService.findAll().then((data) => res.json(data));
  }

  public getAllByBodega(req: Request, res: Response) {
    const bodegaId = req.bodegaId!;
    this.usersService.findAllByBodega(bodegaId).then((data) => res.json(data));
  }

  public getOne(req: Request, res: Response) {
    this.usersService.findOne(+req.params.id).then((data) => res.json(data));
  }

  public create(req: Request, res: Response) {
    createUserSchema.parseAsync(req.body).then((dto) => {
      // Agregar automáticamente el bodegaId del usuario autenticado
      const userData = {
        ...dto,
        bodegaId: req.bodegaId,
      };
      return this.usersService.create(userData).then((data) => res.json(data));
    });
  }

  public update(req: Request, res: Response) {
    UpdateUserSchema.parseAsync(req.body).then((dto) =>
      this.usersService
        .update(+req.params.id, dto)
        .then((data) => res.json(data)),
    );
  }

  public delete(req: Request, res: Response) {
    this.usersService.delete(+req.params.id).then((data) => res.json(data));
  }

  public getMe(req: Request, res: Response) {
    this.usersService.findOne(req.user!).then((data) => res.json(data));
  }

  public updateMe(req: Request, res: Response) {
    const dto = UpdateUserSchema.parse(req.body);
    this.usersService.update(req.user!, dto).then((data) => res.json(data));
  }
}
