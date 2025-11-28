import { UserAttributes, UserCreationAttributes } from './model';
import { CalificacionPendiente } from '@/notificacion/types';

export type UserWithoutPassword = Omit<UserAttributes, 'contrasena'>;

export type AuthenticatedUser = Omit<UserAttributes, 'contrasena'> & {
  token: string;
  calificacion_pendiente?: CalificacionPendiente[];
};

export type CreateUserDto = UserCreationAttributes;

export type UpdateUserDto = Partial<CreateUserDto> & { validado?: Date };
