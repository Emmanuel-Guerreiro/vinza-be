import { z } from 'zod';

export const createMaximosDiasAdelanteReservaSchema = z.object({
  valor: z.coerce.number().int().positive(),
});
