import { Request, Response } from 'express';
import {
  loginSchema,
  registerSchema,
  requestPasswordRecoverySchema,
  requestValidationCodeSchema,
  resetPasswordSchema,
  validateAccountSchema,
} from './schema';
import { IAuthService } from './service';

export class AuthController {
  constructor(private readonly authService: IAuthService) {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.requestPasswordRecovery = this.requestPasswordRecovery.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.validateAccount = this.validateAccount.bind(this);
    this.requestValidationCode = this.requestValidationCode.bind(this);
  }

  public register(req: Request, res: Response) {
    const dto = registerSchema.parse(req.body);
    this.authService.register(dto).then((user) => res.json(user));
  }

  public login(req: Request, res: Response) {
    const dto = loginSchema.parse(req.body);
    this.authService.login(dto).then((response) => res.json(response));
  }

  public requestPasswordRecovery(req: Request, res: Response) {
    const dto = requestPasswordRecoverySchema.parse(req.body);
    this.authService
      .requestPasswordRecovery(dto)
      .then((result) => res.json(result));
  }

  public resetPassword(req: Request, res: Response) {
    const dto = resetPasswordSchema.parse(req.body);
    this.authService.resetPassword(dto).then((result) => res.json(result));
  }

  public validateAccount(req: Request, res: Response) {
    const dto = validateAccountSchema.parse(req.body);
    this.authService.validateAccount(dto).then((result) => res.json(result));
  }

  public requestValidationCode(req: Request, res: Response) {
    const dto = requestValidationCodeSchema.parse(req.body);
    this.authService
      .requestValidationCode(dto)
      .then((result) => res.json(result));
  }
}
