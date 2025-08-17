import { z } from 'zod';

export const updateRecorridoSchema = z.object({
  idUser: z.number().optional(),
  last_optimization: z.date().nullable().optional(),
  deleted_at: z.date().nullable().optional(),
  created_at: z.date().optional(),
});

export const createRecorridoSchema = z.object({
  idUser: z.number().int().positive(),
  last_optimization: z.date().nullable().optional(),
});
