import { z } from 'zod';

export const createEstadoReservaSchema = z.object({
  nombre: z.string(),
});

export const updateEstadoReservaSchema = z.object({
  nombre: z.string().optional(),
});
