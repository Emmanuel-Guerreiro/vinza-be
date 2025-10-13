import { errors } from '@/error';
import { Sucursal } from './model';
import { CreateSucursalDto, UpdateSucursalDto } from './types';
import { sequelize } from '@/db';
import { auditEmitter } from '@/audit/event';
import { Transaction } from 'sequelize';

class SucursalService {
  public async create(dto: CreateSucursalDto, transaction?: Transaction) {
    // If es_principal is true, set all others in the same bodega to false
    if (dto.es_principal) {
      const updatedSucursal = (
        await Sucursal.update(
          { es_principal: false },
          {
            where: { bodegaId: dto.bodegaId, es_principal: true },
            transaction,
            returning: true,
          },
        )
      )[1];
      if (updatedSucursal.length) {
        updatedSucursal.map((s) =>
          auditEmitter.emitEntry({
            tipoEvento: 'sucursal:update',
            valor: s.dataValues,
          }),
        );
      }
    }

    const sucursal = await Sucursal.create(dto, { transaction });

    auditEmitter.emitEntry({
      tipoEvento: 'sucursal:create',
      valor: sucursal.dataValues,
    });

    return sucursal;
  }

  public findAll() {
    return Sucursal.findAll();
  }

  public findAllByBodega(bodegaId: number) {
    return Sucursal.findAll({
      where: { bodegaId },
    });
  }

  public async findOne(id: number) {
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) throw errors.app.sucursal.not_found;
    return sucursal;
  }

  public async update(id: number, dto: UpdateSucursalDto) {
    const transaction = await sequelize.transaction();
    try {
      const sucursal = await Sucursal.findByPk(id, { transaction });
      if (!sucursal) throw errors.app.sucursal.not_found;
      if (dto.bodegaId && dto.bodegaId !== sucursal.bodegaId) {
        throw { message: 'Cannot change bodega of a sucursal', status: 400 };
      }
      if (dto.es_principal) {
        await Sucursal.update(
          { es_principal: false },
          { where: { bodegaId: sucursal.bodegaId }, transaction },
        );
      }
      const updatedSucursal = await sucursal.update(dto, {
        transaction,
        returning: true,
      });

      auditEmitter.emitEntry({
        tipoEvento: 'sucursal:update',
        valor: updatedSucursal.dataValues,
      });

      await transaction.commit();
      return updatedSucursal;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async delete(id: number) {
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) throw errors.app.sucursal.not_found;
    await sucursal.destroy();
    auditEmitter.emitEntry({
      tipoEvento: 'sucursal:delete',
      valor: sucursal.dataValues,
    });
    return sucursal;
  }
}

export const sucursalService = new SucursalService();
export type ISucursalService = typeof sucursalService;
