import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  // age: z.number().min(1, 'Age must be at least 1').optional(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const requestValidationCodeSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const requestPasswordRecoverySchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const validateAccountSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().min(1, 'Code is required'),
});
