import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
//import { errors } from "@/error";
import { Reserva } from './model';
import { CreateReservaDto } from './types';
import { Evento } from '@/evento/model';
import { Recorrido } from '@/recorrido/model';
//import { Op } from "sequelize";

class ReservaService {
  public async create(dto: CreateReservaDto) {
    return sequelize.transaction(async (transaction) => {
      const evento = await Evento.findByPk(dto.instanciaEventoId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!evento)
        throw { message: 'Instancia de evento no encontrada', status: 404 };

      if (dto.cantidadGente > Number(evento.cupo)) {
        throw {
          message: 'Cantidad de gente excede los cupos disponibles',
          status: 400,
        };
      }
      await evento.update(
        { cupo: String(Number(evento.cupo) - dto.cantidadGente) },
        { transaction },
      );

      let recorrido = await Recorrido.findByPk(dto.recorridoId, {
        transaction,
      });

      if (!recorrido) {
        recorrido = await Recorrido.create(
          { idUser: dto.recorridoId },
          { transaction },
        );
      }

      const reserva = await Reserva.create(dto, { transaction });
      if (recorrido && reserva) {
        await reserva.update({ recorridoId: recorrido.id }, { transaction });
      }
      process.nextTick(() => {
        auditEmitter.emit('create', {
          entity: 'reserva',
          id: reserva.idReserva,
        });
        auditEmitter.emit('create', { entity: 'recorrido', id: recorrido.id });
      });

      return reserva;
    });
  }

  public async update(id: number, dto: CreateReservaDto) {
    return sequelize.transaction(async (transaction) => {
      const reserva = await Reserva.findByPk(id, { transaction });
      if (!reserva) throw { message: 'Reserva no encontrada', status: 404 };

      const evento = await Evento.findByPk(dto.instanciaEventoId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!evento)
        throw { message: 'Instancia de evento no encontrada', status: 404 };

      if (dto.cantidadGente > Number(evento.cupo)) {
        throw {
          message: 'Cantidad de gente excede los cupos disponibles',
          status: 400,
        };
      }

      await evento.update(
        { cupo: String(Number(evento.cupo) - dto.cantidadGente) },
        { transaction },
      );

      let recorrido = await Recorrido.findByPk(dto.recorridoId, {
        transaction,
      });

      if (!recorrido) {
        recorrido = await Recorrido.create(
          { idUser: dto.recorridoId },
          { transaction },
        );
      }

      await reserva.update(dto, { transaction });
      if (recorrido && reserva) {
        await reserva.update({ recorridoId: recorrido.id }, { transaction });
      }

      process.nextTick(() => {
        auditEmitter.emit('update', {
          entity: 'reserva',
          id: reserva.idReserva,
        });
        auditEmitter.emit('update', { entity: 'recorrido', id: recorrido.id });
      });

      return reserva;
    });
  }

  public async delete(id: number) {
    return sequelize.transaction(async (transaction) => {
      const reserva = await Reserva.findByPk(id, { transaction });
      if (!reserva) throw { message: 'Reserva no encontrada', status: 404 };

      const evento = await Evento.findByPk(reserva.instanciaEventoId, {
        transaction,

        lock: transaction.LOCK.UPDATE,
      });
      if (!evento)
        throw { message: 'Instancia de evento no encontrada', status: 404 };

      await evento.update(
        { cupo: String(Number(evento.cupo) + reserva.cantidadGente) },
        { transaction },
      );

      await reserva.destroy({ transaction });

      process.nextTick(() => {
        auditEmitter.emit('delete', {
          entity: 'reserva',
          id: reserva.idReserva,
        });
      });

      return reserva;
    });
  }

  public async findAll() {
    return Reserva.findAll({
      include: [
        {
          model: Evento,
          as: 'instanciaEvento',
          attributes: ['idEvento', 'nombre', 'cupo'],
        },
        {
          model: Recorrido,
          as: 'recorrido',
          attributes: ['idRecorrido', 'idUser'],
        },
      ],
    });
  }

  public async findOne(id: number) {
    return Reserva.findByPk(id, {
      include: [
        {
          model: Evento,
          as: 'instanciaEvento',
          attributes: ['idEvento', 'nombre', 'cupo'],
        },
        {
          model: Recorrido,
          as: 'recorrido',
          attributes: ['idRecorrido', 'idUser'],
        },
      ],
    });
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
}

export const reservaService = new ReservaService();
export type IReservaService = typeof reservaService;
