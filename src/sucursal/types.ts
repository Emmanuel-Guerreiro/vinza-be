import { z } from 'zod';
import { createSucursalSchema, updateSucursalSchema } from './schema';

export type CreateSucursalDto = z.infer<typeof createSucursalSchema>;
export type UpdateSucursalDto = z.infer<typeof updateSucursalSchema>;
