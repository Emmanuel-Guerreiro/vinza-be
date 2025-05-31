export type CreateRoleDto = {
  name: string;
};

export type UpdateRoleDto = {
  name?: string;
  permissions?: number[];
};

export type UpdatePermissionDto = {
  name?: string;
};
