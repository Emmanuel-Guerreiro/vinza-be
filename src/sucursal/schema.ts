import { z } from 'zod';

export const createSucursalSchema = z.object({
  nombre: z.string(),
  es_principal: z
    .boolean()
    .optional()
    .default(false)
    .transform((val) => !!val),
  direccion: z.string(),
  aclaraciones: z.string().optional(),
  bodegaId: z.number(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export const updateSucursalSchema = z.object({
  nombre: z.string().optional(),
  es_principal: z.boolean().optional(),
  direccion: z.string().optional(),
  aclaraciones: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});
