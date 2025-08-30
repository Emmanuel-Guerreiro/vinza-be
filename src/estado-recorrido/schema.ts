import { z } from 'zod';

export const createEstadoRecorridoSchema = z.object({
  nombre: z.string(),
});

export const updateEstadoRecorridoSchema = z.object({
  nombre: z.string().optional(),
});
