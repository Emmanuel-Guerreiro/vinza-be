import { authService } from './service';
import { AuthController } from './controller';
import { Router } from 'express';
import logger from '@/logger';

const controller = new AuthController(authService);
const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 required: true
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 required: true
 *                 example: "password"
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 required: true
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/register', controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Autentica un usuario en el sistema. Retorna un token JWT y información completa del usuario incluyendo su bodega asignada.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario registrado en el sistema
 *                 example: "laura.catena@bodegacatenazapata.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *                 example: "catena123"
 *           examples:
 *             admin_catena:
 *               summary: Administrador de Catena Zapata
 *               description: "Usuario administrador de la bodega Catena Zapata - ID 2"
 *               value:
 *                 email: "laura.catena@bodegacatenazapata.com"
 *                 password: "catena123"
 *             admin_zuccardi:
 *               summary: Administrador de Familia Zuccardi
 *               description: "Usuario administrador de la bodega Zuccardi - ID 1"
 *               value:
 *                 email: "sebastian.zuccardi@familiazuccardi.com"
 *                 password: "admin123"
 *             operador_zuccardi:
 *               summary: Operador de Zuccardi
 *               description: "Usuario operador con permisos limitados de la bodega Zuccardi - ID 1"
 *               value:
 *                 email: "maria.fernandez@familiazuccardi.com"
 *                 password: "operador123"
 *             admin_trapiche:
 *               summary: Administrador de Trapiche
 *               description: "Usuario administrador de la bodega Trapiche - ID 3"
 *               value:
 *                 email: "roberto.gonzalez@trapiche.com.ar"
 *                 password: "trapiche123"
 *             admin_luigi_bosca:
 *               summary: Administrador de Luigi Bosca
 *               description: "Usuario administrador de la bodega Luigi Bosca - ID 4"
 *               value:
 *                 email: "alejandra.bosca@luigibosca.com.ar"
 *                 password: "luigibosca123"
 *             super_admin:
 *               summary: Super Administrador (ADMINISTRADOR_SISTEMA)
 *               description: Usuario con acceso total al sistema sin restricciones de bodega
 *               value:
 *                 email: "carlos.rodriguez@vinza.com"
 *                 password: "admin123"
 *     responses:
 *       200:
 *         description: Usuario autenticado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID único del usuario
 *                       example: 4
 *                     nombre:
 *                       type: string
 *                       description: Nombre del usuario
 *                       example: "Laura"
 *                     apellido:
 *                       type: string
 *                       description: Apellido del usuario
 *                       example: "Catena"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email del usuario
 *                       example: "laura.catena@bodegacatenazapata.com"
 *                     bodega:
 *                       type: object
 *                       description: Información de la bodega asignada al usuario
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID de la bodega
 *                           example: 2
 *                         nombre:
 *                           type: string
 *                           description: Nombre de la bodega
 *                           example: "catena-zapata"
 *                         descripcion:
 *                           type: string
 *                           description: Descripción de la bodega
 *                           example: "Bodega Catena Zapata"
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           nombre:
 *                             type: string
 *                             example: "ADMIN"
 *                           permisos:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "EVENTOS_READ"
 *             examples:
 *               success_response:
 *                 summary: Respuesta exitosa
 *                 description: Usuario autenticado con información completa de bodega
 *                 value:
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImJvZGVnYUlkIjoyLCJyb2xlcyI6WzJdLCJpYXQiOjE3MzQ5NzU2ODIsImV4cCI6MTczNDk3OTI4Mn0.example"
 *                   user:
 *                     id: 4
 *                     nombre: "Laura"
 *                     apellido: "Catena"
 *                     email: "laura.catena@bodegacatenazapata.com"
 *                     bodega:
 *                       id: 2
 *                       nombre: "catena-zapata"
 *                       descripcion: "Bodega Catena Zapata"
 *                     roles:
 *                       - id: 2
 *                         nombre: "ADMIN"
 *                         permisos: ["EVENTOS_READ", "GESTOR_EVENTOS", "RESERVAS_READ", "GESTOR_RESERVAS"]
 *       400:
 *         description: Credenciales inválidas o datos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Credenciales inválidas"
 *       401:
 *         description: Usuario no autenticado o cuenta no validada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario no validado o credenciales incorrectas"
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
router.post('/login', controller.login);

/**
 * @openapi
 * /auth/recovery-password:
 *   post:
 *     summary: Request password recovery
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 required: true
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Recovery code sent
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/recovery-password', controller.requestPasswordRecovery);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with code
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: The recovery code
 *                 required: true
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 description: The new password
 *                 required: true
 *                 example: "newpassword"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', controller.resetPassword);

/**
 * @openapi
 * /auth/validate:
 *   post:
 *     summary: Validate account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 required: true
 *                 example: "john.doe@example.com"
 *               code:
 *                 type: string
 *                 description: The validation code
 *                 required: true
 *                 example: "ABC123"
 *     responses:
 *       200:
 *         description: Account validated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/validate', controller.validateAccount);

/**
 * @openapi
 * /auth/request-validation:
 *   post:
 *     summary: Request validation code
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 required: true
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Validation code sent successfully
 *       400:
 *         description: Bad request - validation code too recent
 *       500:
 *         description: Internal server error
 */
router.post('/request-validation', controller.requestValidationCode);

logger.debug('Auth router initialized');
export default router;
