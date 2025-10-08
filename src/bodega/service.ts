import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { sucursalService } from '@/sucursal/service';
import { Bodega } from './model';
import {
  CreateBodegaDto,
  FindAllParams,
  UpdateBodegaDto,
  ValidateBodegaDto,
} from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import { Op, WhereOptions } from 'sequelize';
import { Sucursal } from '@/sucursal/model';
import { usersService } from '@/users/service';

class BodegaService {
  public async create(dto: CreateBodegaDto) {
    const transaction = await sequelize.transaction();
    try {
      const bodega = await Bodega.create(
        {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          telefono: dto.telefono,
        },
        { transaction },
      );
      // Create the first sucursal as main
      await sucursalService.create(
        {
          nombre: dto.nombre,
          es_principal: true,
          direccion: dto.direccion,
          aclaraciones: dto.aclaraciones,
          bodegaId: bodega.id,
        },
        transaction,
      );

      const user = await usersService.findOne(dto.firstUserId, transaction);
      if (!user) throw errors.app.user.not_found;
      await user.update({ bodegaId: bodega.id }, { transaction });

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'bodega:create',
        valor: bodega.dataValues,
      });
      return bodega;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async findAll(
    params: FindAllParams,
  ): Promise<PaginatedResponse<Bodega>> {
    logger.debug(`bodega findAll params ${JSON.stringify(params)}`);
    const where = this.generateWhereConditions(params);
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(params, where, limit),
      Bodega.findAll({
        where,
        order,
        limit,
        offset,
        include: [
          {
            model: Sucursal,
            as: 'sucursales',
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
    const bodega = await Bodega.findByPk(id, {
      include: [
        {
          model: Sucursal,
          as: 'sucursales',
        },
      ],
    });
    if (!bodega) {
      throw errors.app.bodega.not_found;
    }
    return bodega;
  }

  public async update(id: number, dto: UpdateBodegaDto) {
    const transaction = await sequelize.transaction();
    try {
      const bodega = await Bodega.findByPk(id, { transaction });
      if (!bodega) {
        throw errors.app.bodega.not_found;
      }
      const updatedBodega = await bodega.update(dto, {
        transaction,
        returning: true,
      });
      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'bodega:update',
        valor: updatedBodega.dataValues,
      });
      return updatedBodega;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async delete(id: number) {
    const bodega = await Bodega.findByPk(id);
    if (!bodega) {
      throw errors.app.bodega.not_found;
    }
    await bodega.destroy();

    auditEmitter.emitEntry({
      tipoEvento: 'bodega:delete',
      valor: bodega.dataValues,
    });
    return bodega;
  }

  public async validate(id: number, dto: ValidateBodegaDto) {
    const bodega = await Bodega.findByPk(id);
    if (!bodega) {
      throw errors.app.bodega.not_found;
    }
    await bodega.update({ validada: dto.es_valida ? new Date() : null });
    return bodega;
  }

  /**
   * Generate where conditions for the findAll query based on model specific fields
   * If the filter is based on a related model, it will be handled in the include with where condition
   */
  private generateWhereConditions(params: FindAllParams): WhereOptions {
    const where: WhereOptions = {};

    if (params.nombre) {
      where.nombre = {
        [Op.iLike]: `%${params.nombre}%`,
      };
    }

    return where;
  }

  /**
   * Get total count of items and generate complete pagination metadata
   */
  private async getCountAndMetadata(
    params: FindAllParams,
    where: WhereOptions,
    limit: number,
  ) {
    const totalItems = await Bodega.count({
      where,
    });

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: params.page || 1,
      itemsPerPage: limit,
    };
  }
}

export const bodegaService = new BodegaService();

export type IBodegaService = typeof bodegaService;
