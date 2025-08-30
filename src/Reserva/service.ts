import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { Reserva } from '../reserva/model';
import { CreateReservaDto } from '../reserva/types';
import { Evento } from '@/evento/model';
import { Recorrido } from '@/recorrido/model';
import { recorridoService } from '@/recorrido/service';
import { estadoReservaService } from '@/estado-reserva/service';
import { EstadoReserva, HEstadoReserva } from '@/estado-reserva/model';
import { FindOptions } from 'sequelize';
import { eventoService } from '@/evento/service';
import { InstanciaEvento } from '@/instancia-evento';
//import { FindOptions } from 'sequelize';
//import { estadoInstanciaEventoService } from '@/estado-instancia-evento/service';
//import { Op } from "sequelize";

class ReservaService {
  public async create(dto: CreateReservaDto) {
    const transaction = await sequelize.transaction();
    try {
      const Evento = await eventoService.findByInstanciaEvento(
        dto.instanciaEventoId,
      );
      if (!Evento) throw errors.app.evento.not_found;
      const cupos = Evento.cupo;
      const reservasConfirmadas =
        await reservaService.countConfirmadasByInstancia(dto.instanciaEventoId);
      const reservasRestantes = cupos - reservasConfirmadas;
      if (dto.cantidadGente > reservasRestantes) {
        throw errors.app.reserva.cupos_not_enough;
      }
      let recorridoId = dto.recorridoId;
      if (!recorridoId) {
        recorridoId = (await recorridoService.create({ userId: dto.userId }))
          .id;
      }
      const reserva = await Reserva.create(
        { ...dto, recorridoId },
        { transaction },
      );
      //el nombre del estado puede ser diferente.
      await this.createHEstadoReserva(reserva.id, 'Pendiente');
      await transaction.commit();

      auditEmitter.emitEntry({
        tipoEvento: 'reserva:create',
        valor: reserva.dataValues,
      });
      return reserva;
    } catch {
      await transaction.rollback();
      throw errors.app.reserva.create_error;
    }
  }

  public async update(id: number, dto: CreateReservaDto) {
    const transaction = await sequelize.transaction();
    try {
      const reserva = await reservaService.findOne({
        where: { idReserva: id },
        include: [
          {
            model: HEstadoReserva,
            required: true,
            where: { delete_at: null },
            include: [
              {
                model: EstadoReserva,
                required: true,
                where: { nombreEstado: 'Pendiente' },
                attributes: ['id', 'nombre'],
              },
            ],
          },
        ],
      });
      if (!reserva) throw errors.app.reserva.not_found;
      reserva.cantidadGente = dto.cantidadGente;

      await reservaService.update(id, dto);

      auditEmitter.emit('update', { entity: 'recorrido' });
      await transaction.commit();
      return reserva;
    } catch {
      await transaction.rollback();
    }
  }

  public async delete(id: number) {
    return sequelize.transaction(async (transaction) => {
      const reserva = await reservaService.findOne(id);
      if (!reserva) throw errors.app.reserva.not_found;
      const historicoReserva = await HEstadoReserva.findOne({
        where: { reservaId: reserva.idReserva, deleted_at: null },
        include: [
          {
            model: EstadoReserva,
            required: true,
            where: { nombreEstado: 'Pendiente' },
            attributes: ['id', 'nombre'],
          },
        ],
      });
      if (!historicoReserva) throw errors.app.reserva.evento_not_found;
      const estadoReserva = await estadoReservaService.findByName('Cancelado');
      if (!estadoReserva) throw errors.app.estadoReserva.estado_not_found;
      await reserva.destroy({ transaction });

      const nuevoHistorico = await HEstadoReserva.create(
        {
          reservaId: reserva.id,
          estadoReservaId: estadoReserva.id,
        },
        { transaction },
      );
      auditEmitter.emitEntry({
        tipoEvento: 'reserva:delete',
        valor: { reserva, nuevoHistorico },
      });

      return reserva;
    });
  }

  public async findAll() {
    return Reserva.findAll();
  }

  public async findOne(id: number | FindOptions) {
    let reserva;
    if (typeof id === 'number') {
      reserva = await Reserva.findByPk(id);
    } else {
      reserva = await Reserva.findOne(id);
    }
    if (!reserva) {
      throw errors.app.bodega.not_found;
    }
    return reserva;
  }
  public async findAllByEventoId(eventoId: number) {
    return Reserva.findAll({
      where: { instanciaEventoId: eventoId },
      include: [
        {
          model: Evento,
          as: 'instanciaEvento',
          attributes: ['idEvento', 'nombre', 'cupo'],
        },
      ],
    });
  }
  public async findAllByRecorridoId(recorridoId: number) {
    return Reserva.findAll({
      where: { recorridoId: recorridoId },
      include: [
        {
          model: Recorrido,
          as: 'recorrido',
          attributes: ['idRecorrido', 'idUser'],
        },
      ],
    });
  }
  public async asociarEstado_Reserva(
    reservaId: number,
    estadoReservaId: number,
  ) {
    const historicoReserva = await HEstadoReserva.create({
      reservaId: reservaId,
      estadoReservaId: estadoReservaId,
    });
    return historicoReserva;
  }

  public async createHEstadoReserva(idReserva: number, nombreEstado: string) {
    const transaction = await sequelize.transaction();
    try {
      const estadoReserva = await estadoReservaService.findByName(nombreEstado);
      if (estadoReserva) {
        throw errors.app.reserva.create_error;
      }
      const reserva = await reservaService.findOne(idReserva);
      if (!reserva) {
        throw errors.app.reserva.create_error;
      }
      const historico = await HEstadoReserva.create({
        reservaId: idReserva,
        estadoReservaId: estadoReserva!.id,
      });
      await transaction.commit();

      return historico;
    } catch {
      await transaction.rollback();
    }
  }
  public async countConfirmadasByInstancia(instanciaEventoId: number) {
    return Reserva.count({
      include: [
        {
          model: InstanciaEvento,
          as: 'instancia',
          where: { id: instanciaEventoId },
          attributes: [],
        },
        {
          model: HEstadoReserva,
          as: 'historicoEstado',
          required: true,
          where: { deleted_at: null },
          include: [
            {
              model: EstadoReserva,
              as: 'estado',
              required: true,
              where: { nombre: 'Confirmado' },
              attributes: [],
            },
          ],
          attributes: [],
        },
      ],
      distinct: true,
    });
  }
}

export const reservaService = new ReservaService();
export type IReservaService = typeof reservaService;
