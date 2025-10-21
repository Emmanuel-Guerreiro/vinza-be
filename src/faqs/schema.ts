import { z } from 'zod';
import { FaqRecipientsEnum } from './enums';
import { paginationAndOrderSchema } from '@/pagination/schemas';

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

// Valid attributes from the Faq model for ordering
const faqOrderByAttributes = [
  'id',
  'question',
  'answer',
  'recipient_id',
  'created_at',
  'updated_at',
];

export const findAllFaqsSchema = paginationAndOrderSchema(
  faqOrderByAttributes,
).extend({
  recipient: z.nativeEnum(FaqRecipientsEnum).optional(),
});
