'use strict';

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authenticateToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: APIs for managing subscriptions
 */

/**
 * @swagger
 * /api/subscriptions/create:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *               menuId:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               mealPlan:
 *                 type: string
 *               mealFrequency:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *           example:
 *             userId: "123e4567-e89b-12d3-a456-426614174000"
 *             restaurantId: "456e7890-e89b-12d3-a456-426614174001"
 *             menuId: "789e1234-e89b-12d3-a456-426614174002"
 *             categoryName: "Lunch"
 *             mealPlan: "weekly"
 *             mealFrequency: "daily"
 *             startDate: "2025-05-01"
 *             endDate: "2025-05-31"
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/create', authenticateToken, subscriptionController.createSubscription);

/**
 * @swagger
 * /api/subscriptions/update/{id}:
 *   put:
 *     summary: Update an existing subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subscription to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menuId:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               mealPlan:
 *                 type: string
 *               mealFrequency:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *           example:
 *             menuId: "789e1234-e89b-12d3-a456-426614174002"
 *             categoryName: "Dinner"
 *             mealPlan: "monthly"
 *             mealFrequency: "alternate"
 *             startDate: "2025-06-01"
 *             endDate: "2025-06-30"
 *             status: "approved"
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:id', authenticateToken, subscriptionController.updateSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}/status:
 *   patch:
 *     summary: Update subscription status
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *           example:
 *             status: "approved"
 *     responses:
 *       200:
 *         description: Subscription status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/status',authenticateToken, subscriptionController.updateSubscriptionStatus);

/**
 * @swagger
 * /api/subscriptions/menu/{menuId}:
 *   get:
 *     summary: Get subscriptions by menu ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the menu
 *     responses:
 *       200:
 *         description: Subscriptions fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/menu/:menuId',authenticateToken, subscriptionController.getSubscriptionsByMenuId);

/**
 * @swagger
 * /api/subscriptions/restaurant/{restaurantId}:
 *   get:
 *     summary: Get subscriptions by restaurant ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the restaurant
 *     responses:
 *       200:
 *         description: Subscriptions fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/restaurant/:restaurantId',authenticateToken, subscriptionController.getSubscriptionsByRestaurantId);

/**
 * @swagger
 * /api/subscriptions/user:
 *   get:
 *     summary: Get subscriptions by user ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Subscriptions fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/user',authenticateToken, subscriptionController.getSubscriptionsByUserId);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subscription
 *     responses:
 *       200:
 *         description: Subscription fetched successfully
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id',authenticateToken, subscriptionController.getSubscriptionById);

/**
 * @swagger
 * /api/subscriptions/{id}/pause:
 *   patch:
 *     summary: Pause a subscription
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pauseStartDate:
 *                 type: string
 *                 format: date
 *               pauseEndDate:
 *                 type: string
 *                 format: date
 *           example:
 *             pauseStartDate: "2025-05-15"
 *             pauseEndDate: "2025-05-20"
 *     responses:
 *       200:
 *         description: Subscription paused successfully
 *       400:
 *         description: Invalid pause dates
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/pause',authenticateToken, subscriptionController.pauseSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}/resume:
 *   patch:
 *     summary: Resume a paused subscription
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subscription
 *     responses:
 *       200:
 *         description: Subscription resumed successfully
 *       400:
 *         description: Subscription is not paused
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/resume',authenticateToken, subscriptionController.resumeSubscription);



/**
 * @swagger
 * /api/subscriptions/{id}/payment-status:
 *   patch:
 *     summary: Update payment status for a subscription
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed]
 *           example:
 *             paymentStatus: "paid"
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 subscription:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Invalid payment status
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/payment-status', authenticateToken, subscriptionController.updatePaymentStatus);

/**
 * @swagger
 * /api/subscriptions/config:
 *   get:
 *     summary: Get subscription configuration
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Subscription configuration fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mealPlanConfig:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "1 Week": 7
 *                     "2 Week": 14
 *                     "3 Week": 21
 *                     "4 Week": 28
 *                 mealFrequencyConfig:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: integer
 *                   example:
 *                     "Mon-Fri": [1, 2, 3, 4, 5]
 *                     "Mon-Sat": [1, 2, 3, 4, 5, 6]
 *                     "Mon-Sun": [1, 2, 3, 4, 5, 6, 7]
 *       500:
 *         description: Internal server error
 */
router.get('/config',authenticateToken, subscriptionController.getSubscriptionConfig);
module.exports = router;