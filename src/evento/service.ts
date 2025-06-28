import { errors } from '@/error';
import { Evento } from './model';
import { CreateEventoDto, UpdateEventoDto } from './types';
import { auditEmitter } from '@/audit/event';
import { estadoEventoService } from '@/estado-evento/service';
import { sequelize } from '@/db';
import { categoriaEventoService } from '@/categoria-evento/service';
import { CategoriaEvento } from '@/categoria-evento/model';
import { EstadoEvento } from '@/estado-evento/model';

class EventoService {
  public async create(dto: CreateEventoDto) {
    //comentario
    const transaction = await sequelize.transaction();
    try {
      let evento = await Evento.create(dto, { transaction });

      if (dto.estadoId) {
        const estadoEvento = await estadoEventoService.findOne(
          dto.estadoId,
          transaction,
        );
        if (!estadoEvento) throw errors.app.evento.estado_not_found;
        await evento.$set('estados', [estadoEvento.id], { transaction });
      }

      if (dto.categoriaId) {
        const categoriaEvento = await categoriaEventoService.findOne(
          dto.categoriaId,
          transaction,
        );

        await evento.$set('categorias', [categoriaEvento.id], { transaction });
      }

      evento = await evento.save({ transaction, returning: true });

      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'evento:create',
        valor: evento.dataValues,
      });

      return evento;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public findAll() {
    return Evento.findAll({
      include: [
        {
          model: CategoriaEvento,
        },
        {
          model: EstadoEvento,
        },
      ],
    });
  }

  public async findOne(id: number) {
    const evento = await Evento.findByPk(id, {
      include: [
        {
          model: CategoriaEvento,
        },
        {
          model: EstadoEvento,
        },
      ],
    });
    if (!evento) throw errors.app.evento.not_found;

    return evento;
  }

  public async update(id: number, dto: UpdateEventoDto) {
    const transaction = await sequelize.transaction();
    try {
      const evento = await Evento.findByPk(id);
      if (!evento) throw errors.app.evento.not_found;

      if (dto.estadoId) {
        const estadoEvento = await estadoEventoService.findOne(
          dto.estadoId,
          transaction,
        );
        if (!estadoEvento) throw errors.app.evento.estado_not_found;
        await evento.$set('estados', [estadoEvento.id], { transaction });
      }

      if (dto.categoriaId) {
        const categoriaEvento = await categoriaEventoService.findOne(
          dto.categoriaId,
          transaction,
        );

        await evento.$set('categorias', [categoriaEvento.id], { transaction });
      }

      const updatedEvento = await evento.update(dto, {
        returning: true,
        transaction,
      });

      auditEmitter.emitEntry({
        tipoEvento: 'evento:update',
        valor: updatedEvento.dataValues,
      });

      return updatedEvento;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async delete(id: number) {
    const evento = await Evento.findByPk(id);
    if (!evento) throw errors.app.evento.not_found;
    await evento.destroy();

    auditEmitter.emitEntry({
      tipoEvento: 'evento:delete',
      valor: evento.dataValues,
    });
    return evento;
  }
}

export const eventoService = new EventoService();
export type IEventoService = typeof eventoService;
