import { z } from 'zod';

export const createSucursalSchema = z.object({
  nombre: z.string(),
  es_principal: z
    .boolean()
    .optional()
    .default(false)
    .transform((val) => !!val),
  direccion: z.string(),
  bodegaId: z.number(),
});

export const updateSucursalSchema = z.object({
  nombre: z.string().optional(),
  es_principal: z.boolean().optional(),
  direccion: z.string().optional(),
});
