import { errors } from '@/error';
import { CategoriaEvento } from './model';
import { CreateCategoriaEventoDto, UpdateCategoriaEventoDto } from './types';
import { Transaction } from 'sequelize';
import { Evento } from '@/evento/model';
import { auditEmitter } from '@/audit/event';

class CategoriaEventoService {
  public async create(dto: CreateCategoriaEventoDto) {
    const categoriaEvento = await CategoriaEvento.create({
      ...dto,
      nombre: dto.nombre.trim(),
    });
    auditEmitter.emitEntry({
      tipoEvento: 'categoria-evento:create',
      valor: categoriaEvento.dataValues,
    });
    return categoriaEvento;
  }

  public findAll() {
    return CategoriaEvento.findAll();
  }

  public async findOne(id: number, transaction?: Transaction) {
    const categoriaEvento = await CategoriaEvento.findByPk(id, {
      transaction,
    });
    if (!categoriaEvento) throw errors.app.evento.categoria_evento_not_found;
    return categoriaEvento;
  }

  public async update(id: number, dto: UpdateCategoriaEventoDto) {
    const categoriaEvento = await CategoriaEvento.findByPk(id);
    if (!categoriaEvento) throw errors.app.evento.categoria_evento_not_found;
    const updatedCategoriaEvento = await categoriaEvento.update(dto, {
      returning: true,
    });
    auditEmitter.emitEntry({
      tipoEvento: 'categoria-evento:update',
      valor: updatedCategoriaEvento.dataValues,
    });
    return updatedCategoriaEvento;
  }

  public async delete(id: number) {
    const categoriaEvento = await CategoriaEvento.findByPk(id);
    if (!categoriaEvento) throw errors.app.evento.categoria_evento_not_found;

    await categoriaEvento.destroy();
    auditEmitter.emitEntry({
      tipoEvento: 'categoria-evento:delete',
      valor: categoriaEvento.dataValues,
    });
    return categoriaEvento;
  }

  public async canDelete(id: number) {
    const categoriaEvento = await CategoriaEvento.findByPk(id);
    if (!categoriaEvento) throw errors.app.evento.categoria_evento_not_found;

    const eventosWithCategory = await Evento.count({
      where: { categoriaId: id },
    });

    return eventosWithCategory === 0;
  }
}

export const categoriaEventoService = new CategoriaEventoService();
export type ICategoriaEventoService = typeof categoriaEventoService;
