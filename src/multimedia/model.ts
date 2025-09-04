import {
  Column,
  DataType,
  Table,
  Model,
  BelongsTo,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';
import { TipoMultimediaEnum } from './enum';
import { Evento } from '@/evento/model';
import { Bodega } from '@/bodega/model';

export interface MultimediaBodegasAttributes {
  id: number;
  url: string;
  es_portada: Date | null;
  bodegaId: number;
  bodega: Bodega;
  tipo: TipoMultimedia;
  tipoId: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type MultimediaBodegasCreationAttributes = Omit<
  MultimediaBodegasAttributes,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
  | 'bodega'
  | 'bodegaId'
  | 'tipo'
  | 'tipoId'
>;

@Table({
  tableName: 'multimedia_bodegas',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class MultimediaBodegas extends Model<
  MultimediaBodegasAttributes,
  MultimediaBodegasCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  url!: number;

  @Column({ type: DataType.DATE })
  es_portada!: Date | null;

  @ForeignKey(() => Bodega)
  bodegaId!: number;

  @BelongsTo(() => Bodega)
  bodega!: Bodega;

  @ForeignKey(() => TipoMultimedia)
  tipoId!: number;

  @BelongsTo(() => TipoMultimedia)
  tipo!: TipoMultimedia;
}

export interface MultimediaEventosAttributes {
  id: number;
  url: string;
  es_portada: Date | null;
  eventoId: number;
  evento: Evento;
  tipo: TipoMultimedia;
  tipoId: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type MultimediaEventosCreationAttributes = Omit<
  MultimediaEventosAttributes,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
  | 'evento'
  | 'eventoId'
  | 'tipo'
  | 'tipoId'
>;

@Table({
  tableName: 'multimedia_eventos',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class MultimediaEventos extends Model<
  MultimediaEventosAttributes,
  MultimediaEventosCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  url!: number;

  @Column({ type: DataType.DATE })
  es_portada!: Date | null;

  @ForeignKey(() => TipoMultimedia)
  tipoId!: number;

  @BelongsTo(() => TipoMultimedia)
  tipo!: TipoMultimedia;

  @ForeignKey(() => Evento)
  eventoId!: number;

  @BelongsTo(() => Evento)
  evento!: Evento;
}

@Table({
  tableName: 'tipo_multimedia',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
})
export class TipoMultimedia extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.ENUM(...Object.values(TipoMultimediaEnum)),
    allowNull: false,
  })
  nombre!: TipoMultimediaEnum;

  @HasMany(() => MultimediaEventos)
  multimediaEventos!: MultimediaEventos[];
}
