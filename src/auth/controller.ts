import { Request, Response } from 'express';
import { IAuthService } from './service';

export class AuthController {
  constructor(private readonly authService: IAuthService) {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.requestPasswordRecovery = this.requestPasswordRecovery.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.validateAccount = this.validateAccount.bind(this);
  }

  public async register(req: Request, res: Response) {
    this.authService
      .register(req.body)
      .then((user) => res.json(user))
      .catch((e) => res.json(e));
  }

  public async login(req: Request, res: Response) {
    this.authService.login(req.body).then((response) => {
      res.json(response);
    });
  }

  public async requestPasswordRecovery(req: Request, res: Response) {
    this.authService
      .requestPasswordRecovery(req.body)
      .then((result) => res.json(result));
  }

  public async resetPassword(req: Request, res: Response) {
    this.authService.resetPassword(req.body).then((result) => res.json(result));
  }

  public async validateAccount(req: Request, res: Response) {
    this.authService
      .validateAccount(req.body)
      .then((result) => res.json(result));
  }
}
