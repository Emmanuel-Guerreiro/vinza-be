import { Router } from 'express';
import { FaqController } from './controller';
import logger from '@/logger';
import { authMiddleware } from '@/auth/middleware';
import { requirePermissions } from '@/rbac/middleware';
import { Permissions } from '@/rbac/permissions';

const router = Router();
const controller = new FaqController();

// FaqRecipient routes (all require FAQ_MANAGE permission)
/**
 * @openapi
 * /faqs/recipients:
 *   get:
 *     summary: Get all FAQ recipients
 *     tags:
 *       - FAQ Recipients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of FAQ recipients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FaqRecipient'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/recipients',
  authMiddleware,
  requirePermissions([Permissions.FAQ_MANAGE]),
  controller.findAllRecipients,
);

/**
 * @openapi
 * /faqs/recipients/{id}:
 *   get:
 *     summary: Get FAQ recipient by ID
 *     tags:
 *       - FAQ Recipients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FAQ recipient ID
 *     responses:
 *       200:
 *         description: FAQ recipient details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FaqRecipient'
 *       404:
 *         description: FAQ recipient not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/recipients/:id',
  authMiddleware,
  requirePermissions([Permissions.FAQ_MANAGE]),
  controller.findRecipientById,
);

/**
 * @openapi
 * /faqs/recipients:
 *   post:
 *     summary: Create a new FAQ recipient
 *     tags:
 *       - FAQ Recipients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - label
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [END, BODEGAS]
 *                 description: Recipient type
 *               label:
 *                 type: string
 *                 maxLength: 255
 *                 description: Display label for the recipient
 *     responses:
 *       201:
 *         description: FAQ recipient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FaqRecipient'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/recipients',
  authMiddleware,
  requirePermissions([Permissions.FAQ_MANAGE]),
  controller.createRecipient,
);

/**
 * @openapi
 * /faqs/recipients/{id}:
 *   put:
 *     summary: Update FAQ recipient
 *     tags:
 *       - FAQ Recipients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FAQ recipient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [END, BODEGAS]
 *                 description: Recipient type
 *               label:
 *                 type: string
 *                 maxLength: 255
 *                 description: Display label for the recipient
 *     responses:
 *       200:
 *         description: FAQ recipient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FaqRecipient'
 *       400:
 *         description: Validation error
 *       404:
 *         description: FAQ recipient not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put(
  '/recipients/:id',
  authMiddleware,
  requirePermissions([Permissions.FAQ_MANAGE]),
  controller.updateRecipient,
);

/**
 * @openapi
 * /faqs/recipients/{id}:
 *   delete:
 *     summary: Delete FAQ recipient
 *     tags:
 *       - FAQ Recipients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FAQ recipient ID
 *     responses:
 *       200:
 *         description: FAQ recipient deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: FAQ recipient not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/recipients/:id',
  authMiddleware,
  requirePermissions([Permissions.FAQ_MANAGE]),
  controller.deleteRecipient,
);

// Faq routes (read endpoints are public, write endpoints require FAQ_MANAGE permission)
/**
 * @openapi
 * /faqs:
 *   get:
 *     summary: Get all FAQs
 *     tags:
 *       - FAQs
 *     responses:
 *       200:
 *         description: List of FAQs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Faq'
 *       500:
 *         description: Internal server error
 */
router.get('/', controller.findAllFaqs);

/**
 * @openapi
 * /faqs/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags:
 *       - FAQs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FAQ ID
 *     responses:
 *       200:
 *         description: FAQ details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faq'
 *       404:
 *         description: FAQ not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', controller.findFaqById);

/**
 * @openapi
 * /faqs/recipient/{recipientId}:
 *   get:
 *     summary: Get FAQs by recipient
 *     tags:
 *       - FAQs
 *     parameters:
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipient ID
 *     responses:
 *       200:
 *         description: List of FAQs for the recipient
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Faq'
 *       500:
 *         description: Internal server error
 */
router.get('/recipient/:recipientId', controller.findFaqsByRecipient);

/**
 * @openapi
 * /faqs:
 *   post:
 *     summary: Create a new FAQ
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *               - recipient_id
 *             properties:
 *               question:
 *                 type: string
 *                 description: FAQ question
 *               answer:
 *                 type: string
 *                 description: FAQ answer
 *               recipient_id:
 *                 type: integer
 *                 description: ID of the recipient this FAQ is for
 *     responses:
 *       201:
 *         description: FAQ created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faq'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authMiddleware,
  requirePermissions([Permissions.FAQ_MANAGE]),
  controller.createFaq,
);

/**
 * @openapi
 * /faqs/{id}:
 *   put:
 *     summary: Update FAQ
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FAQ ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: FAQ question
 *               answer:
 *                 type: string
 *                 description: FAQ answer
 *               recipient_id:
 *                 type: integer
 *                 description: ID of the recipient this FAQ is for
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Faq'
 *       400:
 *         description: Validation error
 *       404:
 *         description: FAQ not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.FAQ_MANAGE]),
  controller.updateFaq,
);

/**
 * @openapi
 * /faqs/{id}:
 *   delete:
 *     summary: Delete FAQ
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: FAQ ID
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: FAQ not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/:id',
  authMiddleware,
  requirePermissions([Permissions.FAQ_MANAGE]),
  controller.deleteFaq,
);

logger.debug('FAQ router initialized');

export default router;
