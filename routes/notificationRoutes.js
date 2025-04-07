'use strict';

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authenticateToken = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware

// Create a new notification
//router.post('/', authenticateToken, NotificationController.createNotification);

// Mark a notification as read
router.put('/:id/read', authenticateToken, NotificationController.markAsRead);

// Get all notifications for a specific receiver
router.get('/receiver', authenticateToken, NotificationController.getNotificationsByReceiver);

module.exports = router;