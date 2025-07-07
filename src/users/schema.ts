import { z } from 'zod';
import dayjs from 'dayjs';

export const UpdateUserSchema = z.object({
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  email: z.string().email().optional(),
  fecha_nacimiento: z
    .string()
    .datetime()
    .transform((val) => dayjs(val).toDate())
    .refine((date) => dayjs(date).isBefore(dayjs()), {
      message: 'La fecha de nacimiento debe ser anterior a hoy',
    })
    .optional(),
  roles: z.array(z.number()).optional(),
});

export const createUserSchema = z.object({
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  contrasena: z.string(),
  fecha_nacimiento: z
    .string()
    .datetime()
    .transform((val) => dayjs(val).toDate())
    .refine((date) => dayjs(date).isBefore(dayjs()), {
      message: 'La fecha de nacimiento debe ser anterior a hoy',
    })
    .optional(),
  roles: z.array(z.number()).optional(),
});
