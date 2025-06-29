import { z } from 'zod';
import { createMaximosDiasAdelanteReservaSchema } from './schema';

export type EditMaximosDiasAdelanteReservaDto = z.infer<
  typeof createMaximosDiasAdelanteReservaSchema
>;
