import { z } from 'zod';

export const createEstadoInstanciaEventoSchema = z.object({
  nombre: z.string(),
});

export const updateEstadoInstanciaEventoSchema = z.object({
  nombre: z.string().optional(),
});
