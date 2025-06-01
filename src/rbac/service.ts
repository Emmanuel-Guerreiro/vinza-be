import { errors } from '@/error';
import { Rol, Permiso } from './model';
import {
  CreatePermissionDto,
  CreateRolDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from './types';
import { sequelize } from '@/db';

export class RolesService {
  public async create(dto: CreateRolDto) {
    const transaction = await sequelize.transaction();
    try {
      const { permisos, ...rest } = dto;
      const role = await Rol.create(rest, { transaction });

      if (permisos && permisos.length > 0) {
        // Validate that all provided permissions exist
        const foundPermisos = await Permiso.findAll({
          where: { id: permisos },
          transaction,
        });

        if (foundPermisos.length !== permisos.length) {
          throw errors.app.user.permission_not_found;
        }

        await role.$set('permisos', permisos, { transaction });
      }

      await transaction.commit();
      return role;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async findAll() {
    const roles = await Rol.findAll({
      include: [{ model: Permiso, as: 'permisos' }],
    });
    return roles;
  }

  public async findOne(id: number) {
    const role = await Rol.findByPk(id, {
      include: [{ model: Permiso, as: 'permisos' }],
    });
    return role;
  }

  public async update(id: number, dto: UpdateRoleDto) {
    const transaction = await sequelize.transaction();
    try {
      if ('bodegaId' in dto) {
        // Do not allow updating bodegaId after creation
        delete dto.bodegaId;
      }

      const { permisos, ...rest } = dto;

      // Find the role first
      const role = await Rol.findByPk(id, {
        include: [{ model: Permiso, as: 'permisos' }],
        transaction,
      });

      if (!role) {
        throw errors.app.user.roles_not_found;
      }

      // If permissions are provided, update them
      if (permisos && permisos.length > 0) {
        // Validate that all provided permissions exist
        const foundPermisos = await Permiso.findAll({
          where: { id: permisos },
          transaction,
        });

        if (foundPermisos.length !== permisos.length) {
          throw errors.app.user.permission_not_found;
        }

        // Replace current permissions with new ones
        await role.$set('permisos', permisos, { transaction });
        delete dto.permisos;
      }

      // Update other role properties
      await role.update(rest, { transaction });

      await transaction.commit();
      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async delete(id: number) {
    return Rol.destroy({ where: { id } });
  }
}

export class PermissionsService {
  public async update(id: number, dto: UpdatePermissionDto) {
    const permission = await Permiso.update(dto, { where: { id } });
    return permission;
  }

  public async findAll() {
    const permissions = await Permiso.findAll();
    return permissions;
  }

  public async create(dto: CreatePermissionDto) {
    const permission = await Permiso.create(dto);
    return permission;
  }
}

export const permissionsService = new PermissionsService();

export type IPermissionsService = typeof permissionsService;

export const rolesService = new RolesService();

export type IRolesService = typeof rolesService;
