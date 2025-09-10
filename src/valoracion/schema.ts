import { z } from 'zod';

export const createValoracionSchema = z.object({
  valor: z.number().min(1).max(5),
  comentario: z.string().optional(),
  userId: z.number(),
  eventoId: z.number(),
});

export const updateValoracionSchema = z.object({
  valor: z.number().min(1).max(5).optional(),
  comentario: z.string().optional(),
  userId: z.number().optional(),
  eventoId: z.number().optional(),
});
