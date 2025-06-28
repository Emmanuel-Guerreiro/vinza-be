import { z } from 'zod';
import { paginationSchema } from './schemas';

export type Pagination = z.infer<typeof paginationSchema>;

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
  };
};
