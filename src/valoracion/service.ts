import { sequelize } from '@/db';
import { errors } from '@/error';
import { Evento } from '@/evento/model';
import { User } from '@/users/model';
import { Valoracion, ValoracionMedia } from './model';
import { CreateValoracionDto } from './types';
import { Transaction } from 'sequelize';

class ValoracionService {
  public async initializeValoracionMedia(
    eventoId: number,
    transaction: Transaction,
  ) {
    const [valoracionMedia] = await ValoracionMedia.findOrCreate({
      where: { eventoId },
      defaults: { eventoId, valor_medio: 0, cantidad_valoraciones: 0 },
      transaction,
    });

    return valoracionMedia;
  }

  public async create(dto: CreateValoracionDto) {
    const transaction = await sequelize.transaction();
    try {
      const valoracion = await Valoracion.create(dto, { transaction });

      await this.revalidateValoracionMedia(dto.eventoId, transaction);

      await transaction.commit();

      return valoracion;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async findAll() {
    return Valoracion.findAll({ include: [User, Evento] });
  }

  public async findOne(id: number) {
    const valoracion = await Valoracion.findByPk(id, {
      include: [User, Evento],
    });
    if (!valoracion) throw errors.app.valoracion.not_found;

    return valoracion;
  }

  public async delete(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const valoracion = await Valoracion.findByPk(id);
      if (!valoracion) throw errors.app.valoracion.not_found;

      await valoracion.destroy({ transaction });

      await this.revalidateValoracionMedia(valoracion.eventoId, transaction);

      await transaction.commit();

      return valoracion;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async getAverageByEvento(eventoId: number) {
    const valoracionMedia = await ValoracionMedia.findOne({
      where: { eventoId },
    });
    return valoracionMedia?.valor_medio;
  }

  private async revalidateValoracionMedia(
    eventoId: number,
    transaction: Transaction,
  ) {
    const valoraciones = await Valoracion.findAll({
      where: { eventoId },
      transaction,
    });

    const [valoracionMedia] = await ValoracionMedia.findOrCreate({
      where: { eventoId },
      defaults: {
        eventoId,
        valor_medio: 0,
        cantidad_valoraciones: 0,
      },
      transaction,
    });

    await valoracionMedia.update(
      {
        valor_medio: this.calculateValoracionMedia(valoraciones),
        cantidad_valoraciones: valoraciones.length || 0,
      },
      { transaction },
    );

    return valoracionMedia;
  }

  private calculateValoracionMedia(valoraciones: Valoracion[]) {
    if (!valoraciones || valoraciones.length === 0) return 0;
    return (
      valoraciones.reduce((acc, curr) => acc + curr.valor, 0) /
      valoraciones.length
    );
  }
}

export const valoracionService = new ValoracionService();
export type IValoracionService = typeof valoracionService;
