import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export const orderByValidator = (eventoOrderByAttributes: string[]) =>
  z
    .string()
    .default('id:asc')
    .refine(
      (value) => {
        const [attribute, direction] = value.split(':');
        return (
          eventoOrderByAttributes.includes(
            attribute as (typeof eventoOrderByAttributes)[number],
          ) && ['asc', 'desc'].includes(direction)
        );
      },
      {
        message:
          'orderBy must be in format <attribute>:<asc|desc> where attribute is a valid evento field',
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
