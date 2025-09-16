import { Request, Response } from 'express';
import { IPermissionsService, IRolesService } from './service';

export class RolesController {
  constructor(private readonly rolesService: IRolesService) {
    this.create = this.create.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findOne = this.findOne.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response) {
    const { body } = req;
    this.rolesService
      .create(body)
      .then((role) => res.json(role))
      .catch((e) => res.json(e));
  }

  public async findAll(req: Request, res: Response) {
    this.rolesService
      .findAll(req.bodegaId)
      .then((roles) => res.json(roles))
      .catch((e) => res.json(e));
  }

  public async findOne(req: Request, res: Response) {
    const { id } = req.params;
    this.rolesService
      .findOne(+id)
      .then((role) => res.json(role))
      .catch((e) => res.json(e));
  }

  public async update(req: Request, res: Response) {
    const { id } = req.params;
    const { body } = req;
    this.rolesService
      .update(+id, body)
      .then((role) => res.json(role))
      .catch((e) => res.json(e));
  }

  public async delete(req: Request, res: Response) {
    const { id } = req.params;
    this.rolesService
      .delete(+id)
      .then((role) => res.json(role))
      .catch((e) => res.json(e));
  }
}

export class PermissionsController {
  constructor(private readonly permissionsService: IPermissionsService) {
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  public async findAll(req: Request, res: Response) {
    this.permissionsService
      .findAll()
      .then((permissions) => res.json(permissions))
      .catch((e) => res.json(e));
  }

  public async create(req: Request, res: Response) {
    const { body } = req;
    this.permissionsService
      .create(body)
      .then((permission) => res.json(permission))
      .catch((e) => res.json(e));
  }

  public async update(req: Request, res: Response) {
    const { id } = req.params;
    const { body } = req;
    this.permissionsService
      .update(+id, body)
      .then((permission) => res.json(permission))
      .catch((e) => res.json(e));
  }
}
