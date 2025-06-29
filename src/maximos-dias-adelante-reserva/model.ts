import { Model, Table, Column, DataType } from 'sequelize-typescript';

export interface MaximosDiasAdelanteReservaAttributes {
  id?: number;
  created_at: Date;
  deleted_at?: Date | null;
  valor: number;
}

export interface MaximosDiasAdelanteReservaCreationAttributes {
  valor: number;
}

@Table({
  tableName: 'maximos_dias_adelante_reserva',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: false,
})
export class MaximosDiasAdelanteReserva extends Model<
  MaximosDiasAdelanteReservaAttributes,
  MaximosDiasAdelanteReservaCreationAttributes
> {
  @Column({ type: DataType.DATE, allowNull: false })
  created_at!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at?: Date | null;

  @Column({ type: DataType.INTEGER, allowNull: false })
  valor!: number;
}
