import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { HEstadoEvento } from '@/estado-evento/model';
import { Sucursal } from '@/sucursal/model';
import { EstadoEvento } from '@/estado-evento/model';
import { CategoriaEvento } from '@/categoria-evento/model';
import { HCategoriaEvento } from '@/categoria-evento/model';
import { RecurrenciaEvento } from '@/recurrencia-evento/model';

export interface EventoAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  cupo: string;
  precio: number;
  sucursalId: number;
  estadoId?: number;
  categoriaId?: number;
  recurrencias?: RecurrenciaEvento[];
}

export type EventoCreationAttributes = Omit<
  EventoAttributes,
  'id' | 'recurrencias'
>;

@Table({
  tableName: 'eventos',
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class Evento extends Model<EventoAttributes, EventoCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  nombre!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  descripcion!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  cupo!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  precio!: number;

  @ForeignKey(() => Sucursal)
  @Column({ type: DataType.INTEGER, allowNull: false })
  sucursalId!: number;

  @BelongsTo(() => Sucursal)
  sucursal?: Sucursal;

  @ForeignKey(() => EstadoEvento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  estadoId?: number;

  @BelongsTo(() => EstadoEvento)
  estado?: EstadoEvento;

  @ForeignKey(() => CategoriaEvento)
  @Column({ type: DataType.INTEGER, allowNull: true })
  categoriaId?: number;

  @BelongsTo(() => CategoriaEvento)
  categoria?: CategoriaEvento;



  @HasMany(() => RecurrenciaEvento)
  recurrencias?: RecurrenciaEvento[];
}
