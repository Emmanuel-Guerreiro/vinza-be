import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
} from 'sequelize-typescript';
import { Evento } from '@/evento/model';

export interface InstanciaEventoAttributes {
  id: number;
  EventoId: number;
  fecha: Date;
}

export type InstanciaEventoCreationAttributes = Omit<InstanciaEventoAttributes, 'id'>;

@Table({
  tableName: 'InstanciaEvento',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class InstanciaEvento extends Model<
  InstanciaEventoAttributes,
  InstanciaEventoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Evento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  eventoId!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Fecha y hora de la instancia del evento',
  })
  fecha!: Date;

  @BelongsTo(() => Evento)
  evento?: Evento;
}
