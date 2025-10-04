import { z } from 'zod';
import { FaqRecipientsEnum } from './enums';

export const createFaqRecipientSchema = z.object({
  name: z.nativeEnum(FaqRecipientsEnum),
  label: z.string().min(1).max(255),
});

export const updateFaqRecipientSchema = createFaqRecipientSchema.partial();

export const createFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  recipient_id: z.coerce.number().int().positive(),
});

export const updateFaqSchema = createFaqSchema.partial();
