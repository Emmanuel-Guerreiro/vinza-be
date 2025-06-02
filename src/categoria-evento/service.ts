import { errors } from '@/error';
import { CategoriaEvento } from './model';
import { CreateCategoriaEventoDto, UpdateCategoriaEventoDto } from './types';
import { Transaction } from 'sequelize';

class CategoriaEventoService {
  public async create(dto: CreateCategoriaEventoDto) {
    const categoriaEvento = await CategoriaEvento.create(dto);
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
    return updatedCategoriaEvento;
  }

  public async delete(id: number) {
    const categoriaEvento = await CategoriaEvento.findByPk(id);
    if (!categoriaEvento) throw errors.app.evento.categoria_evento_not_found;

    await categoriaEvento.destroy();
    return categoriaEvento;
  }
}

export const categoriaEventoService = new CategoriaEventoService();
export type ICategoriaEventoService = typeof categoriaEventoService;
