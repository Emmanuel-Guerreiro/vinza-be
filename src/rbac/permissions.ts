// This must be kept in sync with the permissions in the database
export enum Permissions {
  // Administrador principal del sistema - control total
  ADMINISTRADOR_SISTEMA = 'ADMINISTRADOR_SISTEMA',

  // Lectura de bodegas
  BODEGAS_READ = 'BODEGAS:READ',

  // Administrador de bodega específica
  ADMINISTRADOR_BODEGA = 'ADMINISTRADOR_BODEGA',

  // Supervisor de bodega - validaciones
  SUPERVISOR_BODEGA = 'SUPERVISOR_BODEGA',

  // Gestión de usuarios
  USERS_READ = 'USERS:READ',
  USERS_MANAGE = 'USERS:MANAGE',

  // Gestión de roles
  ROLES_READ = 'ROLES:READ',
  ROLES_MANAGE = 'ROLES:MANAGE',

  // Gestión de eventos
  EVENTOS_READ = 'EVENTOS:READ',
  GESTOR_EVENTOS = 'GESTOR_EVENTOS',

  // Gestión de reservas
  RESERVAS_READ = 'RESERVAS:READ',
  GESTOR_RESERVAS = 'GESTOR_RESERVAS',

  // Gestión de recorridos
  RECORRIDO_READ = 'RECORRIDO:READ',
  RECORRIDO_MANAGE = 'RECORRIDO:MANAGE',

  // Gestión de valoraciones
  VALORACIONES_READ = 'VALORACIONES:READ',
  VALORACIONES_MANAGE = 'VALORACIONES:MANAGE',

  // Gestión de instancias de eventos
  INSTANCIA_EVENTOS_READ = 'INSTANCIA_EVENTOS:READ',
  INSTANCIA_EVENTOS_MANAGE = 'INSTANCIA_EVENTOS:MANAGE',
}
