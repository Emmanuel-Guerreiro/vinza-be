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
    registerSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.authService.register(dto).then((user) => res.json(user)),
      );
  }

  public login(req: Request, res: Response) {
    loginSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.authService.login(dto).then((response) => res.json(response)),
      );
  }

  public requestPasswordRecovery(req: Request, res: Response) {
    requestPasswordRecoverySchema
      .parseAsync(req.body)
      .then((dto) =>
        this.authService
          .requestPasswordRecovery(dto)
          .then((result) => res.json(result)),
      );
  }

  public resetPassword(req: Request, res: Response) {
    resetPasswordSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.authService.resetPassword(dto).then((result) => res.json(result)),
      );
  }

  public validateAccount(req: Request, res: Response) {
    validateAccountSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.authService
          .validateAccount(dto)
          .then((result) => res.json(result)),
      );
  }

  public requestValidationCode(req: Request, res: Response) {
    requestValidationCodeSchema
      .parseAsync(req.body)
      .then((dto) =>
        this.authService
          .requestValidationCode(dto)
          .then((result) => res.json(result)),
      );
  }
}
