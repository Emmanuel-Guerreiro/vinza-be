import { z } from 'zod';

export const createInstanciaEventoSchema = z.object({
  eventoId: z.number(),
  fecha: z.date(),
});


