import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
export interface ReservaAttributes {
  idReserva: string;
  precio: number;
  cantidadGente: number;
  instanciaEventoId: number;
  recorridoId: number;
}

export type ReservaCreationAttributes = Omit<ReservaAttributes, 'idReserva'> & {
  precio: number;
  cantidadGente: number;
  instanciaEventoId: number;
  recorridoId: number;
};
@Table({
  tableName: 'reservas',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Reserva extends Model<
  ReservaAttributes,
  ReservaCreationAttributes
> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    autoIncrement: false,
  })
  idReserva!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  precio!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  cantidadGente!: number;

  @CreatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  instanciaEventoId!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  recorridoId!: number;
}
