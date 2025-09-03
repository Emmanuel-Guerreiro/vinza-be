import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  requestValidationCodeSchema,
  requestPasswordRecoverySchema,
  resetPasswordSchema,
  validateAccountSchema,
} from './schema';

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RequestValidationCodeDto = z.infer<
  typeof requestValidationCodeSchema
>;
export type RequestPasswordRecoveryDto = z.infer<
  typeof requestPasswordRecoverySchema
>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type ValidateAccountDto = z.infer<typeof validateAccountSchema>;

export type JwtAuthPayload = {
  user: number;
  role: number;
  bodegaId?: number;
};
