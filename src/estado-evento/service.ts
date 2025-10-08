import { Transaction } from 'sequelize';
import { EstadoEvento } from './model';
import { CreateEstadoEventoDto, UpdateEstadoEventoDto } from './types';
import { errors } from '@/error';
import { auditEmitter } from '@/audit/event';
import { Evento } from '@/evento/model';

class EstadoEventoService {
  public async create(dto: CreateEstadoEventoDto) {
    const estadoEvento = await EstadoEvento.create(dto);
    auditEmitter.emitEntry({
      tipoEvento: 'estado-evento:create',
      valor: estadoEvento.dataValues,
    });
    return estadoEvento;
  }

  public async findAll() {
    const estadoEventos = await EstadoEvento.findAll();

    return {
      items: estadoEventos,
      meta: {
        totalItems: estadoEventos.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: estadoEventos.length,
      },
    };
  }

  public async findOne(id: number, transaction?: Transaction) {
    const estadoEvento = await EstadoEvento.findByPk(id, { transaction });
    if (!estadoEvento) throw errors.app.evento.estado_not_found;
    return estadoEvento;
  }

  public async findByName(nombre: string, transaction?: Transaction) {
    const estadoEvento = await EstadoEvento.findOne({
      where: { nombre },
      transaction,
    });
    return estadoEvento;
  }

  public async update(id: number, dto: UpdateEstadoEventoDto) {
    const estadoEvento = await EstadoEvento.findByPk(id);
    if (!estadoEvento) throw errors.app.evento.estado_not_found;
    const updatedEstadoEvento = await estadoEvento.update(dto, {
      returning: true,
    });
    auditEmitter.emitEntry({
      tipoEvento: 'estado-evento:update',
      valor: updatedEstadoEvento.dataValues,
    });
    return updatedEstadoEvento;
  }

  public async delete(id: number) {
    const estadoEvento = await EstadoEvento.findByPk(id);
    if (!estadoEvento) throw errors.app.evento.estado_not_found;
    await estadoEvento.destroy();
    auditEmitter.emitEntry({
      tipoEvento: 'estado-evento:delete',
      valor: estadoEvento.dataValues,
    });
    return estadoEvento;
  }

  public async canDelete(id: number) {
    const estadoEvento = await EstadoEvento.findByPk(id);
    if (!estadoEvento) throw errors.app.evento.estado_not_found;

    const eventosWithStatus = await Evento.count({
      where: { estadoId: id },
    });

    return eventosWithStatus === 0;
  }
}

export const estadoEventoService = new EstadoEventoService();
export type IEstadoEventoService = typeof estadoEventoService;
