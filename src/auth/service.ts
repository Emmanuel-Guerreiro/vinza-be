import config from '@/config';
import { errors } from '@/error';
import { mailer } from '@/mailer/service';
import { MailType } from '@/mailer/types';
import { permissionsService, rolesService } from '@/rbac/service';
import {
  CodigoRecuperarContra,
  User,
  UserAttributes,
  UserCreationAttributes,
} from '@/users/model';
import { usersService } from '@/users/service';
import { AuthenticatedUser } from '@/users/types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { hashPassword } from './auth';
import { JwtAuthPayload, LoginDto, RegisterDto } from './types';

export class AuthService {
  public async register(dto: RegisterDto): Promise<AuthenticatedUser> {
    const role = await this.createDefaultRole();
    // Set user as not validated
    const hashed = await hashPassword(dto.password);
    const user = await usersService.create({
      nombre: dto.name,
      apellido: dto.name, // You might want to add a lastname field to your DTO
      email: dto.email,
      contrasena: hashed,
      validado: null,
      roles: [role.id],
    } as UserCreationAttributes);
    this.sendValidationEmail(user);

    // The user can be authenticated immediately with this
    return this.login({ email: user.email, password: hashed });
  }

  private async sendValidationEmail(user: UserAttributes) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const valido_hasta = new Date(Date.now() + 1000 * 60 * 15); // 15 min
    await CodigoRecuperarContra.create({
      valor: code,
      valido_hasta,
      userId: user.id,
    });
    await mailer.send(MailType.ACCOUNT_VALIDATION, {
      email: user.email,
      data: { code },
    });
  }

  public async login(dto: LoginDto): Promise<AuthenticatedUser> {
    // If more strategies are added must extend this
    const user = await usersService.findOneByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.contrasena))) {
      throw errors.app.auth.non_valid_credentials;
    }

    const token = this.generateAuthToken(user.dataValues);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena: _, ...userWithoutPassword } = user.dataValues;

    return { ...userWithoutPassword, token };
  }

  private async createDefaultRole() {
    const role = await rolesService.create({
      nombre: 'ADMIN',
    });
    const permissions = await permissionsService.findAll();
    await rolesService.update(role.id, {
      permisos: permissions.map((p) => p.id),
    });

    return role;
  }

  private generateAuthToken(dto: UserAttributes) {
    const payload: JwtAuthPayload = { user: dto.id, role: dto.roles[0].id };
    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: '24h',
    });
    return token;
  }

  public async requestPasswordRecovery({
    email,
  }: {
    email: string;
  }): Promise<{ success: boolean }> {
    const user = await usersService.findOneByEmail(email);
    if (!user) throw new Error('User not found');
    // Generate code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const valido_hasta = new Date(Date.now() + 1000 * 60 * 15); // 15 min
    await CodigoRecuperarContra.create({
      valor: code,
      valido_hasta,
      userId: user.id,
    });
    // Send email
    await mailer.send(MailType.PASSWORD_RECOVERY, {
      email: user.email,
      data: { code },
    });
    return { success: true };
  }

  public async resetPassword({
    code,
    password,
  }: {
    code: string;
    password: string;
  }): Promise<AuthenticatedUser> {
    const recovery = await CodigoRecuperarContra.findOne({
      where: {
        valor: code,
        deleted_at: { [Op.is]: null },
        valido_hasta: { [Op.gt]: new Date() },
      },
    });
    if (!recovery) throw errors.app.auth.invalid_or_expired_code;
    const user = await User.findByPk(recovery.userId);
    if (!user) throw errors.app.user.not_found;
    user.contrasena = await hashPassword(password);
    await user.save();
    await recovery.destroy();
    return this.login({ email: user.email, password });
  }

  public async validateAccount({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<{ success: boolean }> {
    const user = await usersService.findOneByEmail(email);
    if (!user) throw errors.app.user.not_found;
    const recovery = await CodigoRecuperarContra.findOne({
      where: {
        valor: code,
        userId: user.id,
        deleted_at: { [Op.is]: null },
        valido_hasta: { [Op.gt]: new Date() },
      },
    });
    if (!recovery) throw errors.app.auth.invalid_or_expired_code;
    user.validado = new Date();
    await user.save();
    await recovery.destroy();
    return { success: true };
  }
}

export const authService = new AuthService();
export type IAuthService = typeof authService;
