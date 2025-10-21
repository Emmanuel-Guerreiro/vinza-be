import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { errors } from '@/error';
import { Recorrido } from './model';
import {
  CreateRecorridoDto,
  FindAllRecorridosParams,
  UpdateRecorridoDto,
} from './types';
import { usersService } from '@/users/service';
import { FindOptions, Transaction, WhereOptions } from 'sequelize';
import { reservaService } from '@/reserva/service';
import { Reserva } from '@/reserva/model';
import { EstadoRecorrido } from '@/estado-recorrido/model';
import { EstadoRecorridoEnum } from '@/estado-recorrido/enum';
import {
  generateOrderConditions,
  generatePaginationParams,
} from '@/pagination';
import { estadoRecorridoService } from '@/estado-recorrido/service';
import logger from '@/logger';
import { InstanciaEvento } from '@/instancia-evento/model';
import { Evento } from '@/evento/model';
import { Sucursal } from '@/sucursal/model';
import { MultimediaEventos } from '@/multimedia/model';

class RecorridoService {
  public async create(dto: CreateRecorridoDto, t?: Transaction) {
    const transaction = t || (await sequelize.transaction());
    try {
      const user = await usersService.findOne(dto.userId, transaction);
      if (!user) throw errors.app.user.not_found;

      const recorrido = await Recorrido.create(
        {
          userId: dto.userId,
          name: dto.name,
        },
        { transaction },
      );

      const estadoPendiente = await estadoRecorridoService.findByName(
        EstadoRecorridoEnum.PENDIENTE,
        transaction,
      );

      if (!estadoPendiente) {
        logger.error(
          `Estado pendiente not found for recorrido ${recorrido.id}`,
        );
        throw errors.app.estado_recorrido.estado_not_found;
      }

      await recorrido.$set('estados', [estadoPendiente.id], { transaction });

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:create',
        valor: recorrido.dataValues,
      });

      const recorridoWithEstados = await this.findById(
        recorrido.id,
        transaction,
      );
      if (!recorridoWithEstados) {
        logger.error(
          `Recorrido ${recorrido.id} not found after create with estados`,
        );
        throw errors.app.recorrido.create_error;
      }
      if (!t) await transaction.commit();
      return recorridoWithEstados;
    } catch (error) {
      if (!t) await transaction.rollback();
      logger.error(JSON.stringify(error));
      throw error;
    }
  }

  public async update(id: number, dto: UpdateRecorridoDto) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await Recorrido.findByPk(id, {
        transaction,
      });

      if (!recorrido) throw errors.app.recorrido.not_found;

      const updatedRecorrido = await recorrido.update(dto, {
        returning: true,
        transaction,
      });

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:update',
        valor: updatedRecorrido.dataValues,
      });

      await transaction.commit();
      return updatedRecorrido;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async confirmarRecorrido(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await this.findOneWithReservas(id, transaction);

      if (
        !recorrido ||
        recorrido.estados?.[0]?.nombre == EstadoRecorridoEnum.CANCELADO
      )
        throw errors.app.recorrido.not_found;

      if (recorrido.estados?.[0]?.nombre === EstadoRecorridoEnum.CONFIRMADO) {
        throw errors.app.recorrido.already_confirmed;
      }

      if (recorrido.reservas.length === 0) {
        throw errors.app.recorrido.empty_recorrido;
      }
      await Promise.all(
        recorrido.reservas.map(async (reserva) => {
          await reservaService.confirmarReserva(reserva.id, transaction);
        }),
      );

      const estadoConfirmado = await estadoRecorridoService.findByName(
        EstadoRecorridoEnum.CONFIRMADO,
        transaction,
      );
      if (!estadoConfirmado) throw errors.app.estado_recorrido.estado_not_found;
      await recorrido?.$set('estados', [estadoConfirmado.id], { transaction });

      await transaction.commit();

      return this.findOneWithReservas(id);
    } catch (error) {
      logger.error(`Error confirming recorrido -> ${JSON.stringify(error)}`);
      await transaction.rollback();
      throw error;
    }
  }

  public async findAll(params: FindAllRecorridosParams) {
    logger.debug(`recorrido findAll params ${JSON.stringify(params)}`);
    const where = this.generateWhereConditions(params);
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);

    const include = this.generateIncludeConditions(params);

    const queryOptions: FindOptions = {
      where,
      order,
      limit,
      offset,
      include,
    };

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(queryOptions, params.page, limit),
      Recorrido.findAll(queryOptions),
    ]);

    return { items, meta };
  }

  public async findById(id: number, transaction?: Transaction) {
    return Recorrido.findByPk(id, {
      include: [
        { model: EstadoRecorrido, as: 'estados' },
        {
          model: Reserva,
          as: 'reservas',
          include: [
            {
              model: InstanciaEvento,
              as: 'instanciaEvento',
              include: [
                {
                  model: Evento,
                  as: 'evento',
                  include: [{ model: Sucursal, as: 'sucursal' }],
                },
              ],
            },
          ],
        },
      ],
      transaction,
    });
  }

  private async findOneWithReservas(id: number, transaction?: Transaction) {
    return Recorrido.findOne({
      where: { id },
      include: [
        { model: Reserva, as: 'reservas' },
        { model: EstadoRecorrido, as: 'estados' },
      ],
      transaction,
    });
  }

  public async delete(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const recorrido = await this.findById(id, transaction);
      const estadoCancelado = await estadoRecorridoService.findByName(
        EstadoRecorridoEnum.CANCELADO,
        transaction,
      );
      if (!estadoCancelado) throw errors.app.estado_recorrido.estado_not_found;
      await recorrido?.$set('estados', [estadoCancelado.id], { transaction });

      if (!recorrido) throw errors.app.recorrido.not_found;
      await recorrido.destroy({ transaction });

      // Cascade with its custom delete logic (status + soft delete)
      await Promise.all(
        recorrido.reservas.map(async (reserva) => {
          await reservaService.delete(reserva.id, transaction);
        }),
      );

      auditEmitter.emitEntry({
        tipoEvento: 'recorrido:delete',
        valor: recorrido.dataValues,
      });

      await transaction.commit();

      return recorrido;
    } catch (error) {
      logger.error(`Error deleting recorrido -> ${JSON.stringify(error)}`);
      await transaction.rollback();
      throw error;
    }
  }

  private generateWhereConditions(params: FindAllRecorridosParams) {
    const where: WhereOptions<Recorrido> = {};
    if (params.userId) where.userId = params.userId;
    return where;
  }

  private generateIncludeConditions(params: FindAllRecorridosParams) {
    const include: FindOptions['include'] = [
      { model: EstadoRecorrido, as: 'estados' },
      {
        model: Reserva,
        as: 'reservas',
        include: [
          {
            model: InstanciaEvento,
            as: 'instanciaEvento',
            include: [
              {
                model: Evento,
                as: 'evento',
                include: [
                  { model: Sucursal, as: 'sucursal' },
                  { model: MultimediaEventos, as: 'multimedia' },
                ],
              },
            ],
          },
        ],
      },
    ];

    // If filtering by estados, add where condition to the estados include
    if (params.estados) {
      include[0] = {
        model: EstadoRecorrido,
        as: 'estados',
        where: {
          nombre: params.estados,
        },
        required: true, // This makes it an INNER JOIN, filtering out recorridos without this estado
      };
    }

    return include;
  }

  private async getCountAndMetadata(
    queryOptions: FindOptions,
    page: number,
    limit: number,
  ) {
    // For count queries, we need to include the estados filter if present
    const { include, ...rest } = queryOptions;
    const countOptions: FindOptions = { ...rest };

    // If there's an estados filter in the include, we need to add it to the count query
    if (include && Array.isArray(include)) {
      const estadosInclude = include.find(
        (inc) =>
          typeof inc === 'object' &&
          inc !== null &&
          'as' in inc &&
          inc.as === 'estados' &&
          'where' in inc &&
          inc.where,
      );
      if (estadosInclude) {
        countOptions.include = [estadosInclude];
      }
    }

    const totalItems = await Recorrido.count(countOptions);

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page || 1,
      itemsPerPage: limit,
    };
  }
}
export const recorridoService = new RecorridoService();
export type IRecorridoService = typeof recorridoService;
