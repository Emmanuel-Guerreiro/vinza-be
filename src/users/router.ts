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
