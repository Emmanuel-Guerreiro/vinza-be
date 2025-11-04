import { z } from 'zod';

export const createCategoriaEventoSchema = z.object({
  nombre: z.string(),
  descripcion: z.string(),
});

export const updateCategoriaEventoSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().optional(),
});
