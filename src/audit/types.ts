import { AuditCreationAttributes } from './model';
import { paginationAndOrderSchema } from '@/pagination/schemas';
import { AuditEvents } from './enum';
import { z } from 'zod';

export type CreateAuditDto = AuditCreationAttributes;
export type AuditEventEntry = Omit<CreateAuditDto, 'userId'> & {
  userId?: number;
};

// Define the orderable attributes for audit
const auditOrderByAttributes = [
  'id',
  'tipoEvento',
  'userId',
  'createdAt',
  'deletedAt',
];

// Create the filter schema that extends pagination
export const auditFilterSchema = paginationAndOrderSchema(
  auditOrderByAttributes,
).extend({
  userId: z.coerce.number().optional(),
  tipoEvento: z.enum(AuditEvents as [string, ...string[]]).optional(),
});

export type AuditFilterParams = z.infer<typeof auditFilterSchema>;
