import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export const orderByValidator = (orderByAttributes: string[]) =>
  z
    .string()
    .default('id:asc')
    .refine(
      (value) => {
        const [attribute, direction] = value.split(':');
        return (
          orderByAttributes.includes(
            attribute as (typeof orderByAttributes)[number],
          ) && ['asc', 'desc'].includes(direction)
        );
      },
      {
        message: `orderBy must be in format <attribute>:<asc|desc> where attribute is in ${orderByAttributes.join(', ')}`,
      },
    );

export const paginationAndOrderSchema = <T extends string[]>(
  orderByAttributes: T,
) =>
  paginationSchema.extend({
    orderBy: orderByValidator(orderByAttributes),
  });

export type PaginationAndOrderParams<T extends string[]> = z.infer<
  ReturnType<typeof paginationAndOrderSchema<T>>
>;

export type PaginationParams = z.infer<typeof paginationSchema>;
