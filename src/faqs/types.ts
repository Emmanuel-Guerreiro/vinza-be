import { z } from 'zod';
import {
  createFaqRecipientSchema,
  updateFaqRecipientSchema,
  createFaqSchema,
  updateFaqSchema,
  findAllFaqsSchema,
} from './schema';

export type CreateFaqRecipientDto = z.infer<typeof createFaqRecipientSchema>;
export type UpdateFaqRecipientDto = z.infer<typeof updateFaqRecipientSchema>;
export type CreateFaqDto = z.infer<typeof createFaqSchema>;
export type UpdateFaqDto = z.infer<typeof updateFaqSchema>;

export type FindAllFaqsParams = z.infer<typeof findAllFaqsSchema>;
