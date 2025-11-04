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
 *               nombre:
 *                 type: string
 *                 description: The name of the role
 *               permisos:
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
 * /rbac/roles/mi-bodega:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Get roles for user's bodega
 *     description: Returns roles that the authenticated user can access - either roles specific to their bodega or global system roles
 *     tags:
 *       - rbac
 *     responses:
 *       200:
 *         description: List of roles available to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Role ID
 *                   nombre:
 *                     type: string
 *                     description: Role name
 *                   bodegaId:
 *                     type: integer
 *                     nullable: true
 *                     description: Bodega ID (null for global roles)
 *                   permisos:
 *                     type: array
 *                     description: List of permissions for this role
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nombre:
 *                           type: string
 *                         clave:
 *                           type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  '/roles/mi-bodega',
  authMiddleware,
  requirePermissions([Permissions.ROLES_READ]),
  rolesController.findByUserBodega,
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
 * /rbac/roles/{id}/can-delete:
 *   security:
 *     - bearerAuth: []
 *   get:
 *     summary: Check if a role can be deleted
 *     tags:
 *       - rbac
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The id of the role
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canDelete:
 *                   type: boolean
 *                   description: Whether the role can be deleted
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/roles/:id/can-delete',
  authMiddleware,
  requirePermissions([Permissions.ROLES_MANAGE]),
  rolesController.canDelete,
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
