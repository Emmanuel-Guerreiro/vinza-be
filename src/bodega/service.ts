import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { sucursalService } from '@/sucursal/service';
import { Bodega } from './model';
import {
  CreateBodegaDto,
  CreateBodegaWithMultimediaDto,
  FindAllParams,
  UpdateBodegaDto,
} from './types';
import logger from '@/logger';
import { PaginatedResponse } from '@/pagination/types';
import {
  generatePaginationParams,
  generateOrderConditions,
} from '@/pagination';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Sucursal } from '@/sucursal/model';
import { multimediaService } from '@/multimedia/service';
import { MultimediaBodegas } from '@/multimedia/model';

class BodegaService {
  public async createWithMultimedia(
    dto: CreateBodegaWithMultimediaDto,
    files: Express.Multer.File[],
  ) {
    const transaction = await sequelize.transaction();
    try {
      const bodega = await this.create(dto, true, transaction);
      if (files.length) {
        await multimediaService.uploadMultipleFilesForBodega(
          {
            files,
            portadaFileName: dto.multimediaPortada,
            bodegaId: bodega.id,
          },
          transaction,
        );
      }

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

  public async create(
    dto: CreateBodegaDto,
    disableAudit: boolean = false,
    t?: Transaction,
  ) {
    const transaction = t || (await sequelize.transaction());
    try {
      const bodega = await Bodega.create(dto, { transaction });
      // Create the first sucursal as main
      sucursalService.create(
        {
          nombre: dto.nombre,
          direccion: 'Principal',
          es_principal: true,
          bodegaId: bodega.id,
        },
        transaction,
      );

      if (!disableAudit) {
        auditEmitter.emitEntry({
          tipoEvento: 'bodega:create',
          valor: bodega.dataValues,
        });
      }
      const bodegaCompleted = await this.findOne(bodega.id, transaction);
      if (!t) await transaction.commit();
      return bodegaCompleted;
    } catch (error) {
      if (!t) await transaction.rollback();
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
            model: MultimediaBodegas,
          },
        ],
      }),
    ]);

    return {
      items,
      meta,
    };
  }

  public async findOne(id: number, transaction?: Transaction) {
    const bodega = await Bodega.findByPk(id, {
      include: [
        {
          model: Sucursal,
        },
        {
          model: MultimediaBodegas,
        },
      ],
      transaction,
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
