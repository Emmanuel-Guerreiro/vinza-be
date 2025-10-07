import { Request, Response, NextFunction } from 'express';
import { IPermissionsService, IRolesService } from './service';

export class RolesController {
  constructor(private readonly rolesService: IRolesService) {
    this.create = this.create.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findOne = this.findOne.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    const { body } = req;
    this.rolesService
      .create(body)
      .then((role) => res.json(role))
      .catch((error) => next(error));
  }

  public async findAll(req: Request, res: Response, next: NextFunction) {
    this.rolesService
      .findAll()
      .then((roles) => res.json(roles))
      .catch((error) => next(error));
  }

  public async findOne(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    this.rolesService
      .findOne(+id)
      .then((role) => res.json(role))
      .catch((error) => next(error));
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { body } = req;
    this.rolesService
      .update(+id, body)
      .then((role) => res.json(role))
      .catch((error) => next(error));
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    this.rolesService
      .delete(+id)
      .then((role) => res.json(role))
      .catch((error) => next(error));
  }
}

export class PermissionsController {
  constructor(private readonly permissionsService: IPermissionsService) {
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.findMyPermissions = this.findMyPermissions.bind(this);
  }

  public async findAll(req: Request, res: Response, next: NextFunction) {
    this.permissionsService
      .findAll()
      .then((permissions) => res.json(permissions))
      .catch((error) => next(error));
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    const { body } = req;
    this.permissionsService
      .create(body)
      .then((permission) => res.json(permission))
      .catch((error) => next(error));
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { body } = req;
    this.permissionsService
      .update(+id, body)
      .then((permission) => res.json(permission))
      .catch((error) => next(error));
  }

  public async findMyPermissions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    this.permissionsService
      .findMyPermissions(req.user!)
      .then((permissions) => res.json(permissions))
      .catch((error) => next(error));
  }
}
