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
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
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
