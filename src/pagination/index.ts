import { PaginationAndOrderParams } from './schemas';
import { Pagination } from './types';

export function generatePaginationParams(params: Pagination) {
  const { page, limit } = params;
  return { limit, offset: (page - 1) * limit };
}

export function generateOrderConditions<K extends string>(
  params: PaginationAndOrderParams<K[]>,
) {
  const orderBy = params.orderBy;
  const [attribute, direction] = orderBy.split(':');
  return [[attribute, direction.toUpperCase()]] as [string, string][];
}
