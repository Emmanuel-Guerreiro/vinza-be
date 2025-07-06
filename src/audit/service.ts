import { Audit } from './model';
import { CreateAuditDto, AuditFilterParams } from './types';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import { WhereOptions } from 'sequelize';
import logger from '@/logger';
import { User } from '@/users/model';

export class AuditService {
  public async create(audit: CreateAuditDto) {
    return Audit.create(audit);
  }

  public async findAll(
    params: AuditFilterParams,
  ): Promise<PaginatedResponse<Audit>> {
    logger.debug(`audit findAll params ${JSON.stringify(params)}`);
    const where = this.generateWhereConditions(params);
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(params, where, limit),
      Audit.findAll({
        where,
        order,
        limit,
        offset,
        include: [
          {
            model: User,
            where: params.userId ? { id: params.userId } : undefined,
            required: !!params.userId,
          },
        ],
      }),
    ]);

    return {
      items,
      meta,
    };
  }

  public async findOne(id: number) {
    return Audit.findByPk(id);
  }

  /**
   * Generate where conditions for the findAll query based on model specific fields
   * If the filter is based on a related model, it will be handled in the include with where condition
   */
  private generateWhereConditions(params: AuditFilterParams): WhereOptions {
    const where: WhereOptions = {};

    if (params.tipoEvento) {
      where.tipoEvento = params.tipoEvento;
    }

    return where;
  }

  /**
   * Get total count of items and generate complete pagination metadata
   */
  private async getCountAndMetadata(
    params: AuditFilterParams,
    where: WhereOptions,
    limit: number,
  ) {
    const totalItems = await Audit.count({
      where,
      include: [
        {
          model: User,
          where: params.userId ? { id: params.userId } : undefined,
          required: !!params.userId,
        },
      ],
    });

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: params.page || 1,
      itemsPerPage: limit,
    };
  }
}

export const auditService = new AuditService();
