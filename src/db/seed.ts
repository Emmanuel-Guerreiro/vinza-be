/* eslint-disable no-console */

import { hashPassword } from '@/auth/auth';
import { Bodega } from '@/bodega/model';
import { categoriaEventoService } from '@/categoria-evento/service';
import config from '@/config';
import { EstadoEventoEnum } from '@/estado-evento/enum';
import { estadoEventoService } from '@/estado-evento/service';
import { EstadoInstanciaEventoEnum } from '@/estado-instancia-evento/enum';
import { EstadoInstanciaEvento as EstadoInstanciaEventoModel } from '@/estado-instancia-evento/model';
import { EstadoRecorridoEnum } from '@/estado-recorrido/enum';
import { estadoRecorridoService } from '@/estado-recorrido/service';
import { EstadoReservaEnum } from '@/estado-reserva/enum';
import { estadoReservaService } from '@/estado-reserva/service';
import { DiaSemana, HoraEvento } from '@/evento/model';
import { eventoService } from '@/evento/service';
import { maximosDiasAdelanteReservaService } from '@/maximos-dias-adelante-reserva/service';
import { Permissions } from '@/rbac/permissions';
import { permissionsService, rolesService } from '@/rbac/service';
import { sucursalService } from '@/sucursal/service';
import { User } from '@/users/model';
import { valoracionService } from '@/valoracion/service';
import { faqService } from '@/faqs/service';
import { FaqRecipientsEnum } from '@/faqs/enums';
import { reservaService } from '@/reserva/service';
import { recorridoService } from '@/recorrido/service';
import { InstanciaEvento } from '@/instancia-evento/model';
import { sequelize } from '.';
// import { estadoReservaService } from '@/estado-reserva/service'; // Comentado temporalmente
// import { EstadoReserva } from '@/estado-reserva/enum'; // Comentado temporalmente

async function seed() {
  try {
    await sequelize.sync({ force: true });
    config.IS_AUDIT_DISABLED = true;

    // ========================================
    // 1. CREAR ENTIDADES BÁSICAS
    // ========================================

    // Estados de recorrido
    const estadoRecorridoDescriptions: Record<EstadoRecorridoEnum, string> = {
      [EstadoRecorridoEnum.PENDIENTE]:
        'El recorrido está pendiente de confirmación',
      [EstadoRecorridoEnum.CONFIRMADO]: 'El recorrido está confirmado y activo',
      [EstadoRecorridoEnum.CANCELADO]: 'El recorrido ha sido cancelado',
    };

    await Promise.all(
      Object.values(EstadoRecorridoEnum).map((nombre) =>
        estadoRecorridoService.create({
          nombre,
          descripcion: estadoRecorridoDescriptions[nombre],
        }),
      ),
    );

    // Create estados de evento
    const estadoDescriptions: Record<EstadoEventoEnum, string> = {
      [EstadoEventoEnum.ACTIVO]:
        'El evento está activo y disponible para reservas',
      [EstadoEventoEnum.SUSPENDIDO]:
        'El evento está temporalmente suspendido y no disponible para reservas',
      [EstadoEventoEnum.FINALIZADO]:
        'El evento ha finalizado y ya no está disponible',
    };

    await Promise.all(
      Object.values(EstadoEventoEnum).map(async (nombre) => {
        return await estadoEventoService.create({
          nombre,
          descripcion: estadoDescriptions[nombre],
        });
      }),
    );

    // Obtener referencias a los estados creados
    const activoEstadoEvento = await estadoEventoService.findByName(
      EstadoEventoEnum.ACTIVO,
    );
    const suspendidoEstadoEvento = await estadoEventoService.findByName(
      EstadoEventoEnum.SUSPENDIDO,
    );
    const finalizadoEstadoEvento = await estadoEventoService.findByName(
      EstadoEventoEnum.FINALIZADO,
    );

    if (
      !activoEstadoEvento ||
      !suspendidoEstadoEvento ||
      !finalizadoEstadoEvento
    ) {
      throw new Error('Error al crear estados de evento');
    }

    // Create categorías de evento
    const categoriaData = [
      {
        nombre: 'Degustación de Vinos',
        descripcion:
          'Eventos centrados en la degustación y evaluación sensorial de diferentes vinos',
      },
      {
        nombre: 'Gastronomía y Maridaje',
        descripcion:
          'Eventos que combinan comida y vinos, enseñando el arte del maridaje',
      },
      {
        nombre: 'Educación Enológica',
        descripcion:
          'Talleres y cursos educativos sobre viticultura, vinificación y enología',
      },
      {
        nombre: 'Entretenimiento y Eventos',
        descripcion:
          'Eventos recreativos y de entretenimiento relacionados con el mundo del vino',
      },
      {
        nombre: 'Bienestar y Salud',
        descripcion:
          'Eventos enfocados en el bienestar y aspectos saludables del consumo de vino',
      },
    ];

    const [
      categoriaDegustacion,
      categoriaGastronomia,
      categoriaEducacion,
      categoriaEntretenimiento,
      categoriaBienestar,
    ] = await Promise.all(
      categoriaData.map(async (data) => {
        return await categoriaEventoService.create(data);
      }),
    );

    // Create estados de instancia evento
    const estadoInstanciaEventoDescriptions: Record<
      EstadoInstanciaEventoEnum,
      string
    > = {
      [EstadoInstanciaEventoEnum.ACTIVA]:
        'La instancia del evento está activa y disponible para reservas',
      [EstadoInstanciaEventoEnum.FINALIZADA]:
        'La instancia del evento ha finalizado',
      [EstadoInstanciaEventoEnum.SUSPENDIDA]:
        'La instancia del evento está temporalmente suspendida',
    };

    await Promise.all(
      Object.values(EstadoInstanciaEventoEnum).map(async (nombre) => {
        return await EstadoInstanciaEventoModel.create({
          nombre,
          descripcion: estadoInstanciaEventoDescriptions[nombre],
        });
      }),
    );

    // Create configuración de días máximos
    await maximosDiasAdelanteReservaService.patch({ valor: 30 });

    // ========================================
    // 2. CREAR PERMISOS Y ROLES
    // ========================================

    // Permission labels in Spanish for admin UI
    const permissionLabels: Record<Permissions, string> = {
      [Permissions.SUDO]: 'Gestion de parametros del sistema',
      [Permissions.BODEGAS_READ]: 'Ver Bodegas',
      [Permissions.BODEGAS_MANAGE]: 'Gestionar Bodegas',
      [Permissions.BODEGAS_VALIDATE]: 'Validar Bodegas',
      [Permissions.USERS_READ]: 'Ver Usuarios',
      [Permissions.USERS_MANAGE]: 'Gestionar Usuarios',
      [Permissions.ROLES_READ]: 'Ver Roles',
      [Permissions.ROLES_MANAGE]: 'Gestionar Roles',
      [Permissions.EVENTOS_READ]: 'Ver Eventos',
      [Permissions.EVENTOS_MANAGE]: 'Gestionar Eventos',
      [Permissions.RESERVAS_READ]: 'Ver Reservas',
      [Permissions.RESERVAS_MANAGE]: 'Gestionar Reservas',
      [Permissions.RECORRIDO_READ]: 'Ver Recorridos',
      [Permissions.RECORRIDO_MANAGE]: 'Gestionar Recorridos',
      [Permissions.VALORACIONES_READ]: 'Ver Valoraciones',
      [Permissions.VALORACIONES_MANAGE]: 'Gestionar Valoraciones',
      [Permissions.INSTANCIA_EVENTOS_READ]: 'Ver Instancias de Eventos',
      [Permissions.INSTANCIA_EVENTOS_MANAGE]: 'Gestionar Instancias de Eventos',
      [Permissions.FAQ_MANAGE]: 'Gestionar Preguntas Frecuentes',
    };

    // Permission descriptions in Spanish
    const permissionDescriptions: Record<Permissions, string> = {
      [Permissions.SUDO]:
        'Acceso completo a todas las funcionalidades del sistema sin restricciones',
      [Permissions.BODEGAS_READ]:
        'Permite visualizar información de bodegas registradas en el sistema',
      [Permissions.BODEGAS_MANAGE]:
        'Permite crear, editar y eliminar bodegas del sistema',
      [Permissions.BODEGAS_VALIDATE]:
        'Permite aprobar o rechazar solicitudes de nuevas bodegas',
      [Permissions.USERS_READ]:
        'Permite visualizar información de usuarios registrados',
      [Permissions.USERS_MANAGE]:
        'Permite crear, editar y eliminar usuarios del sistema',
      [Permissions.ROLES_READ]: 'Permite visualizar roles y permisos asignados',
      [Permissions.ROLES_MANAGE]:
        'Permite crear, editar y asignar roles a usuarios',
      [Permissions.EVENTOS_READ]:
        'Permite visualizar eventos disponibles en el sistema',
      [Permissions.EVENTOS_MANAGE]: 'Permite crear, editar y eliminar eventos',
      [Permissions.RESERVAS_READ]:
        'Permite visualizar reservas realizadas por usuarios',
      [Permissions.RESERVAS_MANAGE]:
        'Permite gestionar reservas: crear, modificar y cancelar',
      [Permissions.RECORRIDO_READ]:
        'Permite visualizar recorridos turísticos disponibles',
      [Permissions.RECORRIDO_MANAGE]:
        'Permite crear, editar y eliminar recorridos turísticos',
      [Permissions.VALORACIONES_READ]:
        'Permite visualizar valoraciones y comentarios de usuarios',
      [Permissions.VALORACIONES_MANAGE]:
        'Permite moderar y gestionar valoraciones de usuarios',
      [Permissions.INSTANCIA_EVENTOS_READ]:
        'Permite visualizar instancias específicas de eventos',
      [Permissions.INSTANCIA_EVENTOS_MANAGE]:
        'Permite gestionar instancias específicas de eventos',
      [Permissions.FAQ_MANAGE]:
        'Permite crear, editar y eliminar preguntas frecuentes',
    };

    // Create all permissions
    const permissions = await Promise.all(
      Object.values(Permissions).map(async (permission) => {
        return await permissionsService.create({
          nombre: permissionLabels[permission],
          clave: permission,
          descripcion: permissionDescriptions[permission],
        });
      }),
    );

    // Create ADMINISTRADOR_SISTEMA role (all permissions), no bodega related
    const adminSistemaRole = await rolesService.create({
      nombre: 'ADMINISTRADOR_SISTEMA',
    });
    await rolesService.update(adminSistemaRole.id, {
      permisos: permissions.map((p) => p.id),
    });

    // ========================================
    // 3. CREAR BODEGAS Y SUCURSALES
    // ========================================

    // Create bodega 'zuccardi'
    const zuccardi = await Bodega.create({
      nombre: 'zuccardi',
      descripcion: 'Bodega Zuccardi',
      telefono: '1234567890',
      validada: new Date(),
    });

    // Create additional bodegas
    const [bodegaCatena, bodegaTrapiche, bodegaLuigiBosca] = await Promise.all([
      Bodega.create({
        nombre: 'Catena Zapata',
        descripcion:
          'Bodega familiar de renombre internacional, reconocida por sus vinos de alta gama y su compromiso con la excelencia enológica en Mendoza.',
        telefono: '1234567890',
        validada: new Date(),
      }),
      Bodega.create({
        nombre: 'Trapiche',
        descripcion:
          'Una de las bodegas más emblemáticas de Argentina, con más de un siglo de tradición vitivinícola y vinos que representan la esencia mendocina.',
        telefono: '1234567890',
        validada: new Date(),
      }),
      Bodega.create({
        nombre: 'Luigi Bosca',
        descripcion:
          'Bodega de origen italiano que combina tradición europea con terroir argentino, produciendo vinos premium de gran elegancia y carácter.',
        telefono: '1234567890',
        validada: new Date(),
      }),
    ]);

    // Create sucursales for zuccardi bodega
    const [mainSucursal, sucursalZuccardi2] = await Promise.all([
      sucursalService.create({
        nombre: 'Zuccardi Valle de Uco',
        es_principal: true,
        direccion: 'Ruta 89, Km 9.5, Valle de Uco, Mendoza',
        aclaraciones:
          'Entrada: pasando el cartel indicador del km 9.5, doblar a la derecha y continuar 200 metros por camino de tierra.',
        bodegaId: zuccardi.id,
        latitude: -32.9668703,
        longitude: -68.5661086,
      }),
      sucursalService.create({
        nombre: 'Zuccardi Maipú',
        es_principal: false,
        direccion: 'Ruta 60, Km 22, Maipú, Mendoza',
        aclaraciones:
          'Entrada: después del semáforo del km 22, tomar el primer acceso a la izquierda y seguir 150 metros hasta el portón principal.',
        bodegaId: zuccardi.id,
        latitude: -33.7653509,
        longitude: -69.1378212,
      }),
    ]);

    // Create sucursales for Catena Zapata
    const [sucursalCatena1, sucursalCatena2] = await Promise.all([
      sucursalService.create({
        nombre: 'Catena Zapata Agrelo',
        es_principal: true,
        direccion: 'Ruta Provincial 15, Km 29, Agrelo, Luján de Cuyo, Mendoza',
        aclaraciones:
          'Doblar a la izquierda por el camino señalizado, aproximadamente 300 metros hasta la bodega.',
        bodegaId: bodegaCatena.id,
        latitude: -33.1632792,
        longitude: -68.9125061,
      }),
      sucursalService.create({
        nombre: 'Catena Zapata Showroom',
        es_principal: false,
        direccion: 'Av. España 206',
        aclaraciones: 'Entrada por calle España.',
        bodegaId: bodegaCatena.id,
        latitude: -32.9328185,
        longitude: -68.8483713,
      }),
    ]);

    // Create sucursales for Trapiche
    const [sucursalTrapiche1] = await Promise.all([
      sucursalService.create({
        nombre: 'Trapiche Maipú',
        es_principal: true,
        direccion: 'Ruta Nacional 7, Km 1038, Maipú, Mendoza',
        aclaraciones:
          'En la ruta 7, tomar el acceso a la derecha, portón de hierro visible desde la ruta.',
        bodegaId: bodegaTrapiche.id,
        latitude: -32.972088345986265,
        longitude: -68.74613558021821,
      }),
    ]);

    // Create sucursales for Luigi Bosca
    const [sucursalLuigiBosca1] = await Promise.all([
      sucursalService.create({
        nombre: 'Luigi Bosca Luján de Cuyo',
        es_principal: true,
        direccion: 'Ruta Provincial 82, Km 8, Luján de Cuyo, Mendoza',
        aclaraciones:
          'Entrada: en el km 8, doblar a la derecha después del cartel indicador, seguir 80 metros por calle asfaltada hasta el portón principal.',
        bodegaId: bodegaLuigiBosca.id,
        latitude: -33.01942098518029,
        longitude: -68.87230483106366,
      }),
    ]);

    // ========================================
    // 4. CREAR ROLES ESPECÍFICOS DE BODEGA
    // ========================================

    // Create admin role (all permissions except SUDO), related to zuccardi
    const adminRole = await rolesService.create({
      nombre: 'ADMIN',
      bodegaId: zuccardi.id,
    });

    // All permissions for admin (no restrictions)
    const adminPermissions = permissions;
    await rolesService.update(adminRole.id, {
      permisos: adminPermissions.map((p) => p.id),
    });

    // Create operador role (limited permissions - no event management)
    const operadorRole = await rolesService.create({
      nombre: 'OPERADOR',
      bodegaId: zuccardi.id,
    });

    // Limited permissions for operador: read permissions + reservations management
    const operadorPermissions = permissions.filter(
      (p) =>
        p.nombre === Permissions.EVENTOS_READ ||
        p.nombre === Permissions.RESERVAS_READ ||
        p.nombre === Permissions.RESERVAS_MANAGE ||
        p.nombre === Permissions.INSTANCIA_EVENTOS_READ ||
        p.nombre === Permissions.VALORACIONES_READ ||
        p.nombre === Permissions.BODEGAS_READ ||
        p.nombre === Permissions.USERS_READ,
    );

    await rolesService.update(operadorRole.id, {
      permisos: operadorPermissions.map((p) => p.id),
    });

    // ========================================
    // 5. CREAR USUARIOS
    // ========================================

    // Create admin user related to zuccardi
    const adminPassword = await hashPassword('admin123');
    const adminUser = await User.create({
      nombre: 'Sebastián',
      apellido: 'Zuccardi',
      email: 'sebastian.zuccardi@familiazuccardi.com',
      contrasena: adminPassword,
      roles: [adminRole.id],
      bodegaId: zuccardi.id,
      validado: new Date(),
    });
    await adminUser.$set('roles', [adminRole.id]);

    // Create operador user with limited permissions
    const operadorPassword = await hashPassword('operador123');
    const operadorUser = await User.create({
      nombre: 'María',
      apellido: 'Fernández',
      email: 'maria.fernandez@familiazuccardi.com',
      contrasena: operadorPassword,
      roles: [operadorRole.id],
      bodegaId: zuccardi.id,
      validado: new Date(),
    });
    await operadorUser.$set('roles', [operadorRole.id]);

    // Create administrador sistema user with ADMINISTRADOR_SISTEMA role and no bodega
    const adminSistemaPassword = await hashPassword('admin123');
    const adminSistema = await User.create({
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@vinza.com',
      contrasena: adminSistemaPassword,
      roles: [adminSistemaRole.id],
      validado: new Date(),
    });
    await adminSistema.$set('roles', [adminSistemaRole.id]);

    // Create validated user with email user@app.com
    const userAppPassword = await hashPassword('user123');
    const userApp = await User.create({
      nombre: 'Pedro',
      apellido: 'Perez',
      email: 'pedro.perez@email.com',
      contrasena: userAppPassword,
      validado: new Date(),
      fecha_nacimiento: new Date('1990-01-01'),
    });
    await userApp.$set('roles', [adminRole.id]);
    // ========================================
    // 5.1 CREAR USUARIOS PARA CADA BODEGA
    // ========================================

    // Create user for Catena Zapata (usa el mismo rol ADMIN)
    const adminCatenaPassword = await hashPassword('catena123');
    const adminCatena = await User.create({
      nombre: 'Laura',
      apellido: 'Catena',
      email: 'laura.catena@bodegacatenazapata.com',
      contrasena: adminCatenaPassword,
      roles: [adminRole.id], // Mismo rol ADMIN
      bodegaId: bodegaCatena.id,
      validado: new Date(),
    });
    await adminCatena.$set('roles', [adminRole.id]);

    // Create user for Trapiche (usa el mismo rol ADMIN)
    const adminTrapichePassword = await hashPassword('trapiche123');
    const adminTrapiche = await User.create({
      nombre: 'Roberto',
      apellido: 'González',
      email: 'roberto.gonzalez@trapiche.com.ar',
      contrasena: adminTrapichePassword,
      roles: [adminRole.id], // Mismo rol ADMIN
      bodegaId: bodegaTrapiche.id,
      validado: new Date(),
    });
    await adminTrapiche.$set('roles', [adminRole.id]);

    // Create user for Luigi Bosca (usa el mismo rol ADMIN)
    const adminLuigiBoscaPassword = await hashPassword('luigibosca123');
    const adminLuigiBosca = await User.create({
      nombre: 'Alejandra',
      apellido: 'Bosca',
      email: 'alejandra.bosca@luigibosca.com.ar',
      contrasena: adminLuigiBoscaPassword,
      roles: [adminRole.id], // Mismo rol ADMIN
      bodegaId: bodegaLuigiBosca.id,
      validado: new Date(),
    });
    await adminLuigiBosca.$set('roles', [adminRole.id]);

    // ========================================
    // 6. CREAR EVENTOS
    // ========================================

    const evento1 = await eventoService.create({
      nombre: 'Cata de espumantes',
      descripcion: 'Cata de la linea de espumantes de la bodega',
      cupo: 20,
      sucursalId: mainSucursal.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaBienestar.id,
      precio: 25000,
      duracion: 2,
      recurrencias: [
        {
          dia: DiaSemana.LUNES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.MIERCOLES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 1 creado');

    // Evento 2: Taller de cocina mensual
    const evento2 = await eventoService.create({
      nombre: 'Rally de las bodegas',
      descripcion:
        'Accede a recorrer la visita de autos clasicos, acompañado de un almuerzo de pasos.',
      cupo: 15,
      sucursalId: mainSucursal.id,
      estadoId: suspendidoEstadoEvento.id,
      categoriaId: categoriaGastronomia.id,
      precio: 35000,
      duracion: 3,
      recurrencias: [
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_10_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.DOMINGO,
          hora: HoraEvento.HORA_10_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 2 creado');

    // Evento 3: Charlas de tecnología (múltiples horarios por día)
    const evento3 = await eventoService.create({
      nombre: 'Taller de enología',
      descripcion:
        'Introducción a la vinificación, cata de aromsa y degustación técnica (4 vinos).',
      cupo: 50,
      sucursalId: mainSucursal.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEducacion.id,
      precio: 10000,
      duracion: 2,
      recurrencias: [
        {
          dia: DiaSemana.MARTES,
          hora: HoraEvento.HORA_19_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.MARTES,
          hora: HoraEvento.HORA_20_30,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.JUEVES,
          hora: HoraEvento.HORA_19_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.JUEVES,
          hora: HoraEvento.HORA_20_30,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 3 creado');

    // Evento 4: Evento único con fecha específica
    const evento4 = await eventoService.create({
      nombre: 'Conferencia sobre innovación',
      descripcion:
        'Conferencia especial sobre innovación en la industria del vino.',
      cupo: 100,
      sucursalId: mainSucursal.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEntretenimiento.id,
      precio: 10000,
      duracion: 2,
      recurrencias: [
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_18_00,
          fecha_desde: new Date('2025-11-28'),
          fecha_hasta: new Date('2025-11-28'),
        },
      ],
    });

    // Evento 5: Cata de vinos en Catena Zapata (Mendoza)
    const evento5 = await eventoService.create({
      nombre: 'Cata de Vinos Premium',
      descripcion: 'Degustación de vinos premium de Catena Zapata.',
      cupo: 25,
      sucursalId: sucursalCatena1.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaDegustacion.id,
      precio: 12000,
      duracion: 2,
      recurrencias: [
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_16_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 5 creado');

    // Evento 6: Tour gastronómico en Catena (Buenos Aires)
    const evento6 = await eventoService.create({
      nombre: 'Tour Gastronómico',
      descripcion: 'Recorrido por la gastronomía porteña con vinos Catena.',
      cupo: 30,
      sucursalId: sucursalCatena2.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaGastronomia.id,
      precio: 12000,
      duracion: 4,
      recurrencias: [
        {
          dia: DiaSemana.DOMINGO,
          hora: HoraEvento.HORA_11_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 6 creado');

    // Evento 7: Clases de cocina regional en Trapiche Central
    const evento7 = await eventoService.create({
      nombre: 'Cocina Regional Mendocina',
      descripcion: 'Aprende a cocinar platos típicos de Mendoza.',
      cupo: 18,
      sucursalId: sucursalTrapiche1.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaGastronomia.id,
      precio: 17000,
      duracion: 3,
      recurrencias: [
        {
          dia: DiaSemana.MIERCOLES,
          hora: HoraEvento.HORA_19_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_15_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });

    console.log('Evento 7 creado');

    // Evento 8: Festival de vinos del norte en Trapiche Norte
    const evento8 = await eventoService.create({
      nombre: 'Festival de Vinos del valle',
      descripcion: 'Celebración de vinos de altura de Salta.',
      cupo: 60,
      sucursalId: sucursalTrapiche1.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaEntretenimiento.id,
      precio: 3500,
      duracion: 2,
      recurrencias: [
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_20_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 8 creado');

    // Evento 9: Enología para principiantes en Trapiche Sur
    const evento9 = await eventoService.create({
      nombre: 'Enología para Principiantes',
      descripcion: 'Introducción al mundo del vino y la enología',
      cupo: 35,
      sucursalId: sucursalTrapiche1.id,
      estadoId: suspendidoEstadoEvento.id,
      categoriaId: categoriaEducacion.id,
      precio: 28000,
      duracion: 2,
      recurrencias: [
        {
          dia: DiaSemana.JUEVES,
          hora: HoraEvento.HORA_18_30,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 9 creado');

    // Evento 10: Maridaje de vinos en Luigi Bosca
    const evento10 = await eventoService.create({
      nombre: 'Maridaje de Vinos y Quesos',
      descripcion: 'Aprende a combinar vinos con diferentes tipos de queso',
      cupo: 22,
      sucursalId: sucursalLuigiBosca1.id,
      estadoId: activoEstadoEvento.id,
      categoriaId: categoriaGastronomia.id,
      precio: 28000,
      duracion: 2,
      recurrencias: [
        {
          dia: DiaSemana.MARTES,
          hora: HoraEvento.HORA_19_30,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_17_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 10 creado');

    // Evento 11: Evento especial en Zuccardi segunda sucursal
    const evento11 = await eventoService.create({
      nombre: 'Noche de Malbec',
      descripcion: 'Celebración especial del Malbec argentino',
      cupo: 40,
      sucursalId: sucursalZuccardi2.id,
      estadoId: finalizadoEstadoEvento.id,
      categoriaId: categoriaEntretenimiento.id,
      precio: 20000,
      duracion: 3,
      recurrencias: [
        {
          dia: DiaSemana.VIERNES,
          hora: HoraEvento.HORA_21_00,
          fecha_desde: new Date('2025-08-23'),
          fecha_hasta: new Date('2026-12-31'),
        },
      ],
    });
    console.log('Evento 11 creado');

    // Evento 12: Evento único en Luigi Bosca
    const evento12 = await eventoService.create({
      nombre: 'Gran Cena de Gala',
      descripcion: 'Cena de gala con vinos premium de Luigi Bosca',
      cupo: 80,
      sucursalId: sucursalLuigiBosca1.id,
      estadoId: finalizadoEstadoEvento.id,
      categoriaId: categoriaEntretenimiento.id,
      precio: 150000,
      duracion: 4,
      recurrencias: [
        {
          dia: DiaSemana.SABADO,
          hora: HoraEvento.HORA_20_00,
          fecha_desde: new Date('2025-12-20'),
          fecha_hasta: new Date('2025-12-20'),
        },
      ],
    });
    console.log('Evento 12 creado');

    // ========================================
    // 7. CREAR VALORACIONES
    // ========================================

    // Create 3 valoraciones for each event
    const valoracionesData = [
      { valor: 5, comentario: 'Excelente evento', userId: adminUser.id },
      { valor: 3, comentario: 'Estuvo bien', userId: adminUser.id },
      { valor: 1, comentario: 'No me gustó', userId: adminUser.id },
      { valor: 4, comentario: 'Me gustó', userId: adminUser.id },
    ];
    for (const evento of [
      evento1,
      evento2,
      evento3,
      evento4,
      evento5,
      evento6,
      evento7,
      evento8,
      evento9,
      evento10,
      evento11,
      evento12,
    ]) {
      for (const val of valoracionesData) {
        if (Math.random() < 0.5) {
          await valoracionService.create({
            ...val,
            eventoId: evento.id,
          });
        }
      }
    }

    await maximosDiasAdelanteReservaService.patch({ valor: 30 });

    // ========================================
    // 8. CREAR FAQS
    // ========================================

    // Create FAQ recipients
    const [endRecipient, bodegasRecipient] = await Promise.all([
      faqService.createRecipient({
        name: FaqRecipientsEnum.END,
        label: 'Usuarios finales',
      }),
      faqService.createRecipient({
        name: FaqRecipientsEnum.BODEGAS,
        label: 'Administradores de bodegas',
      }),
    ]);

    // Create FAQ 1: About bodega validation (for administrators)
    await faqService.createFaq({
      question: '¿Cómo funciona la validación de bodegas?',
      answer:
        'La validación de bodegas es un proceso manual que realizan los administradores del sistema. Cuando una nueva bodega solicita acceso, los administradores revisan la documentación y verifican que cumpla con todos los requisitos antes de aprobar su ingreso a la plataforma. Este proceso puede tomar entre 2 a 5 días hábiles.',
      recipient_id: bodegasRecipient.id,
    });

    // Create FAQ 2: About recurring events (for end users)
    await faqService.createFaq({
      question: '¿Qué son los eventos recurrentes?',
      answer:
        'Los eventos recurrentes son actividades que se repiten periódicamente siguiendo un patrón establecido. Por ejemplo, clases de yoga todos los lunes y miércoles, o catas de vinos los primeros sábados de cada mes. Estos eventos te permiten planificar con anticipación y participar regularmente en las actividades que más te interesan.',
      recipient_id: endRecipient.id,
    });

    console.log('FAQs creados exitosamente');

    // ========================================
    // 9. ESTADOS DE RESERVA (COMENTADO TEMPORALMENTE)
    // ========================================

    // Create all estado reserva - Comentado temporalmente
    const estadoReservaDescriptions: Record<EstadoReservaEnum, string> = {
      [EstadoReservaEnum.PENDIENTE]:
        'La reserva está pendiente de confirmación',
      [EstadoReservaEnum.CONFIRMADA]: 'La reserva está confirmada y activa',
      [EstadoReservaEnum.CANCELADA]: 'La reserva ha sido cancelada',
    };

    await Promise.all(
      Object.values(EstadoReservaEnum).map(async (nombre) => {
        return await estadoReservaService.create({
          nombre,
          descripcion: estadoReservaDescriptions[nombre],
        });
      }),
    );

    // ========================================
    // 10. CREAR USUARIOS FINALES Y RESERVAS
    // ========================================

    console.log('Creando usuarios finales y reservas...');

    // Crear usuarios finales (clientes)
    const usuariosFinales = [
      {
        nombre: 'Ana',
        apellido: 'García',
        email: 'ana.garcia@email.com',
        contrasena: await hashPassword('cliente123'),
        fecha_nacimiento: new Date('1990-05-15'),
        validado: new Date(),
      },
      {
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos.lopez@email.com',
        contrasena: await hashPassword('cliente123'),
        fecha_nacimiento: new Date('1985-08-22'),
        validado: new Date(),
      },
      {
        nombre: 'María',
        apellido: 'Rodríguez',
        email: 'maria.rodriguez@email.com',
        contrasena: await hashPassword('cliente123'),
        fecha_nacimiento: new Date('1992-12-03'),
        validado: new Date(),
      },
      {
        nombre: 'Diego',
        apellido: 'Martínez',
        email: 'diego.martinez@email.com',
        contrasena: await hashPassword('cliente123'),
        fecha_nacimiento: new Date('1988-03-18'),
        validado: new Date(),
      },
      {
        nombre: 'Laura',
        apellido: 'Fernández',
        email: 'laura.fernandez@email.com',
        contrasena: await hashPassword('cliente123'),
        fecha_nacimiento: new Date('1995-07-25'),
        validado: new Date(),
      },
    ];

    const usuariosCreados = await Promise.all(
      usuariosFinales.map(async (usuarioData) => {
        return await User.create(usuarioData);
      }),
    );

    console.log(`${usuariosCreados.length} usuarios finales creados`);

    // Obtener todos los eventos para crear instancias específicas
    const eventosDisponibles = await eventoService.findAll({
      page: 1,
      limit: 20,
      orderBy: 'nombre:ASC',
    });

    // Crear instancias de eventos para diferentes fechas
    const fechasFuturas = [
      new Date('2025-11-01'), // Viernes
      new Date('2025-11-02'), // Sábado
      new Date('2025-11-03'), // Domingo
      new Date('2025-11-08'), // Viernes
      new Date('2025-11-09'), // Sábado
      new Date('2025-11-10'), // Domingo
      new Date('2025-11-15'), // Viernes
      new Date('2025-11-16'), // Sábado
      new Date('2025-11-22'), // Viernes
      new Date('2025-11-23'), // Sábado
    ];

    const instanciasCreadas = [];

    // Crear instancias para más eventos
    for (let i = 0; i < eventosDisponibles.items.length; i++) {
      const evento = eventosDisponibles.items[i];

      // Obtener todas las recurrencias del evento
      const recurrencias = await evento.$get('recurrencias');
      if (recurrencias.length > 0) {
        // Crear 2-3 instancias por evento para tener más variedad
        const numInstanciasPorEvento = Math.floor(Math.random() * 2) + 2; // 2-3 instancias

        for (
          let j = 0;
          j < numInstanciasPorEvento && j < fechasFuturas.length;
          j++
        ) {
          const fecha = fechasFuturas[j % fechasFuturas.length];
          const recurrencia = recurrencias[0]; // Usar la primera recurrencia

          const instancia = await InstanciaEvento.create({
            fecha: fecha,
            eventoId: evento.id,
            recurrenciaEventoId: recurrencia.id,
          });
          instanciasCreadas.push({
            instancia,
            evento,
          });
        }
      }
    }

    console.log(`${instanciasCreadas.length} instancias de eventos creadas`);

    // Obtener estados de reserva
    const estadoPendiente = await estadoReservaService.findByName(
      EstadoReservaEnum.PENDIENTE,
    );
    const estadoConfirmada = await estadoReservaService.findByName(
      EstadoReservaEnum.CONFIRMADA,
    );
    const estadoCancelada = await estadoReservaService.findByName(
      EstadoReservaEnum.CANCELADA,
    );

    // Crear múltiples reservas con diferentes estados para cada usuario
    for (let i = 0; i < usuariosCreados.length; i++) {
      const usuario = usuariosCreados[i];

      // Crear 2-3 recorridos por usuario para simular diferentes viajes
      const numRecorridos = Math.floor(Math.random() * 2) + 2; // 2-3 recorridos

      for (let r = 0; r < numRecorridos; r++) {
        const recorrido = await recorridoService.create({
          userId: usuario.id,
          name: `Recorrido ${r + 1} de ${usuario.nombre} - ${new Date().toLocaleDateString()}`,
        });

        // Crear 2-4 reservas por recorrido
        const numReservasPorRecorrido = Math.floor(Math.random() * 3) + 2; // 2-4 reservas
        const instanciasParaEsteRecorrido = instanciasCreadas
          .sort(() => 0.5 - Math.random()) // Mezclar aleatoriamente
          .slice(0, numReservasPorRecorrido);

        for (const { instancia, evento } of instanciasParaEsteRecorrido) {
          try {
            // Determinar el estado de la reserva
            const randomEstado = Math.random();
            let estadoActual = estadoPendiente!;

            // 40% PENDIENTE, 40% CONFIRMADA, 20% CANCELADA
            if (randomEstado > 0.4 && randomEstado <= 0.8 && estadoConfirmada) {
              estadoActual = estadoConfirmada!;
            } else if (randomEstado > 0.8 && estadoCancelada) {
              estadoActual = estadoCancelada!;
            }

            const reserva = await reservaService.create({
              userId: usuario.id,
              instanciaEventoId: instancia.id,
              recorridoId: recorrido.id,
              cantidadGente: Math.floor(Math.random() * 4) + 1, // 1-4 personas
            });

            // Cambiar el estado de la reserva si no es PENDIENTE
            if (
              estadoActual &&
              estadoActual.nombre !== EstadoReservaEnum.PENDIENTE
            ) {
              await reserva.$set('estados', [estadoActual.id]);
            }

            console.log(
              `Reserva creada para ${usuario.nombre} en ${evento.nombre}: ${reserva.cantidadGente} personas - Estado: ${estadoActual?.nombre || 'N/A'}`,
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Error desconocido';
            console.log(
              `Error creando reserva para ${usuario.nombre}: ${errorMessage}`,
            );
          }
        }
      }
    }

    // Crear reservas adicionales para usuarios específicos con eventos específicos
    console.log('Creando reservas adicionales para mayor variedad...');

    // Obtener eventos específicos por bodega para diversificar
    const eventosZuccardi = [evento1, evento2, evento3];
    const eventosCatena = [evento5, evento6];
    const eventosTrapiche = [evento7, evento8, evento9];
    const eventosLuigiBosca = [evento10];

    // Crear usuarios adicionales para tener más reservas
    const usuariosAdicionales = [
      {
        nombre: 'Pedro',
        apellido: 'Gomez',
        email: 'pedro.gomez@email.com',
      },
      {
        nombre: 'Sofia',
        apellido: 'Morales',
        email: 'sofia.morales@email.com',
      },
      { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@email.com' },
    ];

    for (const userData of usuariosAdicionales) {
      const usuarioAdicional = await User.create({
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        contrasena: await hashPassword('cliente123'),
        fecha_nacimiento: new Date('1990-01-01'),
        validado: new Date(),
      });

      // Crear 1-2 recorridos con 3-5 reservas cada uno
      const numRecorridos = Math.floor(Math.random() * 2) + 1;

      for (let r = 0; r < numRecorridos; r++) {
        const recorrido = await recorridoService.create({
          userId: usuarioAdicional.id,
          name: `Recorrido ${r + 1} de ${usuarioAdicional.nombre}`,
        });

        // Seleccionar eventos aleatorios de todas las bodegas
        const todosEventos = [
          ...eventosZuccardi,
          ...eventosCatena,
          ...eventosTrapiche,
          ...eventosLuigiBosca,
        ];

        // Crear instancias para estos eventos
        for (const evento of todosEventos) {
          if (Math.random() > 0.5) continue; // Skip 50% de eventos

          const recurrencias = await evento.$get('recurrencias');
          if (recurrencias.length > 0) {
            const fecha =
              fechasFuturas[Math.floor(Math.random() * fechasFuturas.length)];
            const instancia = await InstanciaEvento.create({
              fecha,
              eventoId: evento.id,
              recurrenciaEventoId: recurrencias[0].id,
            });

            const reserva = await reservaService.create({
              userId: usuarioAdicional.id,
              instanciaEventoId: instancia.id,
              recorridoId: recorrido.id,
              cantidadGente: Math.floor(Math.random() * 3) + 1,
            });

            // Asignar estado aleatorio
            const randomEstado = Math.random();
            let estadoActual = estadoPendiente!;

            if (randomEstado > 0.4 && randomEstado <= 0.8 && estadoConfirmada) {
              estadoActual = estadoConfirmada!;
            } else if (randomEstado > 0.8 && estadoCancelada) {
              estadoActual = estadoCancelada!;
            }

            if (
              estadoActual &&
              estadoActual.nombre !== EstadoReservaEnum.PENDIENTE
            ) {
              await reserva.$set('estados', [estadoActual.id]);
            }

            console.log(
              `Reserva adicional creada para ${usuarioAdicional.nombre} en ${evento.nombre}`,
            );
          }
        }
      }
    }

    console.log('Usuarios finales y reservas creados exitosamente');

    console.log('Database seeded successfully');

    // ========================================
    // INFORMACIÓN DE USUARIOS PARA PRUEBAS
    // ========================================
    console.log('\n=== USUARIOS CREADOS PARA PRUEBAS ===');
    console.log('ADMINISTRADOR_SISTEMA (Sin bodega - Acceso total):');
    console.log('  Email: carlos.rodriguez@vinza.com | Password: admin123');
    console.log(
      '  Nombre: Carlos Rodríguez - Administrador principal del sistema',
    );
    console.log('\nADMIN ZUCCARDI (Bodega 1):');
    console.log(
      '  Email: sebastian.zuccardi@familiazuccardi.com | Password: admin123',
    );
    console.log(
      '  Nombre: Sebastián Zuccardi - Administrador de Familia Zuccardi',
    );
    console.log('\nOPERADOR ZUCCARDI (Bodega 1):');
    console.log(
      '  Email: maria.fernandez@familiazuccardi.com | Password: operador123',
    );
    console.log('  Nombre: María Fernández - Operadora de eventos');
    console.log('\nADMIN CATENA ZAPATA (Bodega 2):');
    console.log(
      '  Email: laura.catena@bodegacatenazapata.com | Password: catena123',
    );
    console.log('  Nombre: Laura Catena - Administradora de Catena Zapata');
    console.log('\nADMIN TRAPICHE (Bodega 3):');
    console.log(
      '  Email: roberto.gonzalez@trapiche.com.ar | Password: trapiche123',
    );
    console.log('  Nombre: Roberto González - Administrador de Trapiche');
    console.log('\nADMIN LUIGI BOSCA (Bodega 4):');
    console.log(
      '  Email: alejandra.bosca@luigibosca.com.ar | Password: luigibosca123',
    );
    console.log('  Nombre: Alejandra Bosca - Administradora de Luigi Bosca');
    console.log('\n=== USUARIO VALIDADO ===');
    console.log('USUARIO VALIDADO:');
    console.log('  Email: user@app.com | Password: user123');
    console.log('  Nombre: User App - Usuario validado');
    console.log('\n=== USUARIOS FINALES (CLIENTES) ===');
    console.log('USUARIO FINAL 1:');
    console.log('  Email: ana.garcia@email.com | Password: cliente123');
    console.log('  Nombre: Ana García - Cliente final');
    console.log('\nUSUARIO FINAL 2:');
    console.log('  Email: carlos.lopez@email.com | Password: cliente123');
    console.log('  Nombre: Carlos López - Cliente final');
    console.log('\nUSUARIO FINAL 3:');
    console.log('  Email: maria.rodriguez@email.com | Password: cliente123');
    console.log('  Nombre: María Rodríguez - Cliente final');
    console.log('\nUSUARIO FINAL 4:');
    console.log('  Email: diego.martinez@email.com | Password: cliente123');
    console.log('  Nombre: Diego Martínez - Cliente final');
    console.log('\nUSUARIO FINAL 5:');
    console.log('  Email: laura.fernandez@email.com | Password: cliente123');
    console.log('  Nombre: Laura Fernández - Cliente final');
    console.log('\n=== PRUEBAS DE AUTORIZACIÓN ===');
    console.log('1. Login con laura.catena@bodegacatenazapata.com');
    console.log(
      '2. Intentar crear evento en sucursal de Zuccardi → Debe fallar (403)',
    );
    console.log('3. Crear evento en sucursal de Catena → Debe funcionar (201)');
    console.log('4. Intentar modificar evento de Trapiche → Debe fallar (403)');
    console.log('5. Modificar evento de Catena → Debe funcionar (200)');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    config.IS_AUDIT_DISABLED = false;
  }
}

// Run the seed
seed()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
