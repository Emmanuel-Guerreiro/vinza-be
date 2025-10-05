import { Router } from 'express';
import { PermissionsController, RolesController } from './controller';
import { permissionsService, rolesService } from './service';
import { requirePermissions } from './middleware';
import { authMiddleware } from '@/auth/middleware';
import { Permissions } from './permissions';
import logger from '@/logger';

const rolesController = new RolesController(rolesService);
const permissionsController = new PermissionsController(permissionsService);

const router = Router();

/**
 * @openapi
 * /rbac/roles:
 *   security:
 *     - bearerAuth: []
 *   post:
 *     summary: Create a new role
 *     tags:
 *       - rbac
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the role
 *               permissions:
 *                 type: array
 *                 description: The permissions of the role
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '/roles',
  authMiddleware,
  requirePermissions([Permissions.ROLES_MANAGE]),
  rolesController.create,
);

/**
 * @openapi
 * /rbac/roles:
 *   get:
 *     summary: Get all roles
 *     tags:
 *       - rbac
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  '/roles',
  authMiddleware,
  requirePermissions([Permissions.ROLES_READ]),
  rolesController.findAll,
);

/**
 * @openapi
 * /rbac/roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags:
 *       - rbac
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the role
 *     responses:
 *       200:
 *         description: Role fetched successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/roles/:id',
  authMiddleware,
  requirePermissions([Permissions.ROLES_READ]),
  rolesController.findOne,
);

/**
 * @openapi
 * /rbac/roles/{id}:
 *   put:
 *     summary: Update a role by ID
 *     tags:
 *       - rbac
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: The name of the role
 *                 example: "admin"
 *               permisos:
 *                 type: array
 *                 description: The permissions of the role
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put(
  '/roles/:id',
  authMiddleware,
  requirePermissions([Permissions.ROLES_MANAGE]),
  rolesController.update,
);

/**
 * @openapi
 * /rbac/roles/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags:
 *       - rbac
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the role
 *     responses:
 *       204:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/roles/:id',
  authMiddleware,
  requirePermissions([Permissions.ROLES_MANAGE]),
  rolesController.delete,
);

/**
 * @openapi
 * /rbac/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags:
 *       - rbac
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get(
  '/permissions',
  authMiddleware,
  requirePermissions([Permissions.ROLES_READ]),
  permissionsController.findAll,
);

/**
 * @openapi
 * /rbac/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags:
 *       - rbac
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: The name of the permission
 *                 example: "create_user"
 *               clave:
 *                 type: string
 *                 description: The key of the permission
 *                 example: "create_user"

 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '/permissions',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  permissionsController.create,
);

/**
 * @openapi
 * /rbac/permissions/{id}:
 *   put:
 *     summary: Update a permission by ID
 *     tags:
 *       - rbac
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the permission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: The name of the permission
 *                 example: "create_user"
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put(
  '/permissions/:id',
  authMiddleware,
  requirePermissions([Permissions.SUDO]),
  permissionsController.update,
);

/**
 * @openapi
 * /rbac/me:
 *   get:
 *     summary: Get my permissions
 *     tags:
 *       - rbac
 */
router.get('/me', authMiddleware, permissionsController.findMyPermissions);

logger.debug('Rbac router initialized');

export default router;
