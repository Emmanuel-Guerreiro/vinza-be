import { errors } from '@/error';
import { Sucursal } from './model';
import { CreateSucursalDto, UpdateSucursalDto } from './types';
import { sequelize } from '@/db';
import { auditEmitter } from '@/audit/event';
import { Transaction } from 'sequelize';
import { Evento } from '@/evento/model';

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

      if ('bodegaId' in dto && dto.bodegaId !== sucursal.bodegaId) {
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

    if (sucursal.es_principal) {
      throw errors.app.sucursal.cannot_delete_principal;
    }

    const sucursalesCount = await Sucursal.count({
      where: { bodegaId: sucursal.bodegaId },
    });

    if (sucursalesCount === 1) {
      throw errors.app.sucursal.cannot_delete_only_sucursal;
    }

    await sucursal.destroy();
    auditEmitter.emitEntry({
      tipoEvento: 'sucursal:delete',
      valor: sucursal.dataValues,
    });
    return sucursal;
  }

  public async canDelete(id: number) {
    const sucursal = await Sucursal.findByPk(id);
    if (!sucursal) throw errors.app.sucursal.not_found;

    const eventosWithSucursal = await Evento.count({
      where: { sucursalId: id },
    });

    return eventosWithSucursal === 0;
  }
}

export const sucursalService = new SucursalService();
export type ISucursalService = typeof sucursalService;
