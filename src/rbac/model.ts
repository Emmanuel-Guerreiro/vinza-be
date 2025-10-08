import {
  BelongsToMany,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { User, HRolUsuario } from '@/users/model';
import { Bodega } from '@/bodega/model';

// Junction table for many-to-many relationship
@Table({
  tableName: 'h_rol_permisos',
  paranoid: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
})
export class HRolPermiso extends Model {
  @ForeignKey(() => Rol)
  @Column({ type: DataType.INTEGER, allowNull: false })
  rolId!: number;

  @ForeignKey(() => Permiso)
  @Column({ type: DataType.INTEGER, allowNull: false })
  permisoId!: number;
}

export interface PermisoAttributes {
  nombre: string;
  roles: Rol[];
}

export interface PermisoCreationAttributes
  extends Omit<PermisoAttributes, 'roles'> {
  roles?: Rol['id'][];
}

export interface PermissionAttributes {
  id: number;
  nombre: string;
  descripcion?: string;
  clave: string;
  roles: Rol[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type PermissionCreationAttributes = Omit<
  PermissionAttributes,
  'roles' | 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@Table({
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  tableName: 'permisos',
})
export class Permiso extends Model<
  PermissionAttributes,
  PermissionCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  nombre!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  descripcion?: string;

  @Index
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  clave!: string;

  @BelongsToMany(() => Rol, () => HRolPermiso)
  roles!: Rol[];
}

export interface RolAttributes {
  id: number;
  nombre: string;
  permisos: Permiso[];
  usuarios: User[];
  bodegaId?: number;
  bodega?: Bodega;
}

export interface RolCreationAttributes
  extends Omit<RolAttributes, 'permisos' | 'usuarios' | 'id' | 'bodega'> {
  permisos?: Permiso['id'][];
  bodegaId?: number;
}

@Table({
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  tableName: 'roles',
})
export class Rol extends Model<RolAttributes, RolCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  nombre!: string;

  @BelongsToMany(() => Permiso, () => HRolPermiso)
  permisos!: Permiso[];

  @BelongsToMany(() => User, () => HRolUsuario)
  usuarios!: User[];

  @ForeignKey(() => Bodega)
  @Column({ type: DataType.INTEGER, allowNull: true })
  bodegaId?: number;

  @BelongsTo(() => Bodega)
  bodega?: Bodega;
}
