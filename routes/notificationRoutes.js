'use strict';

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authenticateToken = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: APIs for managing notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the notification
 *               message:
 *                 type: string
 *                 description: Message content of the notification
 *               receiverId:
 *                 type: string
 *                 description: ID of the receiver
 *           example:
 *             title: "New Order"
 *             message: "You have a new order assigned."
 *             receiverId: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Uncomment the route if needed
// router.post('/', authenticateToken, NotificationController.createNotification);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/read', authenticateToken, NotificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/receiver:
 *   get:
 *     summary: Get all notifications for the logged-in receiver
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 notificationsCount:
 *                   type: integer
 *             example:
 *               notifications:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   title: "New Order"
 *                   message: "You have a new order assigned."
 *                   status: "unread"
 *                   createdAt: "2025-05-11T10:00:00Z"
 *               notificationsCount: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/receiver', authenticateToken, NotificationController.getNotificationsByReceiver);

module.exports = router;