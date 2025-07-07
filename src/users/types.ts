import { UserAttributes, UserCreationAttributes } from './model';

export type UserWithoutPassword = Omit<UserAttributes, 'contrasena'>;

export type AuthenticatedUser = Omit<UserAttributes, 'contrasena'> & {
  token: string;
};

export type CreateUserDto = UserCreationAttributes;

export type UpdateUserDto = Partial<CreateUserDto> & { validado?: Date };
