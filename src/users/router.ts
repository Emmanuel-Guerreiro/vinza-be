import { authMiddleware } from '@/auth/middleware';
import logger from '@/logger';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';
import { UsersController } from '@/users/controller';
import { usersService } from '@/users/service';
import { Router } from 'express';

const controller = new UsersController(usersService);
const router = Router();

/**
 * @openapi
 * /users:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Success
 */
router.get(
  '',
  authMiddleware,
  requirePermissions([Permissions.USERS_READ]),
  controller.getAll,
);

/**
 * @openapi
 * /users/mi-bodega:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Get all users from the authenticated user's bodega [USERS_READ]
 *     description: Retorna todos los usuarios que pertenecen a la misma bodega que el usuario autenticado. Requiere permiso USERS_READ.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Usuarios de la bodega obtenidos exitosamente
 *         content:
 *           application/json:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   description: ID único del usuario
 *                   example: 1
 *                 nombre:
 *                   type: string
 *                   description: Nombre del usuario
 *                   example: "Laura"
 *                 apellido:
 *                   type: string
 *                   description: Apellido del usuario
 *                   example: "Catena"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Email del usuario
 *                   example: "laura.catena@bodegacatenazapata.com"
 *                 edad:
 *                   type: number
 *                   description: Edad del usuario
 *                   example: 35
 *                 validado:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de validación del usuario
 *                   example: "2025-01-15T10:30:00.000Z"
 *                 bodegaId:
 *                   type: number
 *                   description: ID de la bodega a la que pertenece el usuario
 *                   example: 2
 *                 roles:
 *                   type: array
 *                   description: Roles asignados al usuario
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 2
 *                       nombre:
 *                         type: string
 *                         example: "ADMIN"
 *                       permisos:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["EVENTOS_READ", "EVENTOS_MANAGE", "USERS_READ"]
 *                 bodega:
 *                   type: object
 *                   description: Información de la bodega del usuario
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 2
 *                     nombre:
 *                       type: string
 *                       example: "catena-zapata"
 *                     descripcion:
 *                       type: string
 *                       example: "Bodega Catena Zapata"
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación del usuario
 *                   example: "2025-01-15T10:30:00.000Z"
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de última actualización del usuario
 *                   example: "2025-01-15T10:30:00.000Z"
 *             examples:
 *               catena_users:
 *                 summary: Usuarios de Catena Zapata
 *                 description: Lista de usuarios de la bodega Catena Zapata
 *                 value:
 *                   - id: 4
 *                     nombre: "Laura"
 *                     apellido: "Catena"
 *                     email: "laura.catena@bodegacatenazapata.com"
 *                     edad: 35
 *                     validado: "2025-01-15T10:30:00.000Z"
 *                     bodegaId: 2
 *                     roles:
 *                       - id: 2
 *                         nombre: "ADMIN"
 *                         permisos: ["EVENTOS_READ", "EVENTOS_MANAGE", "USERS_READ", "USERS_MANAGE"]
 *                     bodega:
 *                       id: 2
 *                       nombre: "catena-zapata"
 *                       descripcion: "Bodega Catena Zapata"
 *                     created_at: "2025-01-15T10:30:00.000Z"
 *                     updated_at: "2025-01-15T10:30:00.000Z"
 *                   - id: 5
 *                     nombre: "Carlos"
 *                     apellido: "Mendoza"
 *                     email: "carlos.mendoza@bodegacatenazapata.com"
 *                     edad: 28
 *                     validado: "2025-01-15T10:30:00.000Z"
 *                     bodegaId: 2
 *                     roles:
 *                       - id: 3
 *                         nombre: "OPERADOR"
 *                         permisos: ["EVENTOS_READ", "RESERVAS_READ", "RESERVAS_MANAGE"]
 *                     bodega:
 *                       id: 2
 *                       nombre: "catena-zapata"
 *                       descripcion: "Bodega Catena Zapata"
 *                     created_at: "2025-01-15T10:30:00.000Z"
 *                     updated_at: "2025-01-15T10:30:00.000Z"
 *       401:
 *         description: No autorizado - Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token inválido o faltante"
 *       403:
 *         description: Prohibido - Permisos insuficientes. Se requiere USERS_READ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No tienes permisos para acceder a este recurso"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get(
  '/mi-bodega',
  authMiddleware,
  requirePermissions([Permissions.USERS_READ]),
  controller.getAllByBodega,
);

/**
 * @openapi
 * /users/me:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Get the current user
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/me', authMiddleware, controller.getMe);

/**
 * @openapi
 * /users/me:
 *   security:
 *     - bearerAuth: []
 *   put:
 *     summary: Update the current user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: The name of the user
 *                 example: "John Doe"
 *               apellido:
 *                 type: string
 *                 description: The last name of the user
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               fecha_nacimiento:
 *                 type: string
 *                 description: The date of birth of the user
 *                 example: "1990-01-01"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: The roles of the user
 *                 example: [1]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/me', authMiddleware, controller.updateMe);

/**
 * @openapi
 * /users/{id}:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Get a user by id
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the user
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 nombre:
 *                   type: string
 *                 apellido:
 *                   type: string
 *                 email:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: number
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *         description: User found successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.USERS_READ]),
  controller.getOne,
);

/**
 * @openapi
 * /users:
 *   security:
 *     - bearerAuth: []
 *   post:
 *     summary: Create a user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre del usuario
 *                 required: true
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 description: El apellido del usuario
 *                 required: true
 *                 example: "Pérez"
 *               edad:
 *                 type: number
 *                 description: La edad del usuario (opcional)
 *                 required: true
 *                 example: 30
 *               email:
 *                 type: string
 *                 description: El correo electrónico del usuario
 *                 required: true
 *                 example: "juan.perez@example.com"
 *               contrasena:
 *                 type: string
 *                 description: La contraseña del usuario
 *                 required: true
 *                 example: "password"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Los ids de los roles del usuario
 *                 required: true
 *                 example: [1]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '',
  authMiddleware,
  requirePermissions([Permissions.USERS_MANAGE]),
  controller.create,
);

/**
 * @openapi
 * /users/{id}:
 *   security:
 *     - bearerAuth: []
 *   put:
 *     summary: Update a user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: "John Doe"
 *               age:
 *                 type: number
 *                 description: The age of the user
 *                 example: 25
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: "password"
 *               roleId:
 *                 type: number
 *                 description: The role id of the user
 *                 example: 1
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.USERS_MANAGE]),
  controller.update,
);

/**
 * @openapi
 * /users/{id}:
 *   security:
 *     - bearerAuth: []
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the user
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.USERS_MANAGE]),
  controller.delete,
);

logger.debug('Users router initialized');

export default router;
