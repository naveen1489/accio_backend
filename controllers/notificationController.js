'use strict';

const NotificationService = require('../services/notificationService');

class NotificationController {
    /**
     * Create a new notification
     */
    static async createNotification(req, res) {
        try {
            const { ReceiverId, SenderId, NotificationMessage, NotificationType, NotificationMetadata } = req.body;

            const notification = await NotificationService.createNotification({
                ReceiverId,
                SenderId,
                NotificationMessage,
                NotificationType,
                NotificationMetadata,
            });

            res.status(201).json({ message: 'Notification created successfully', notification });
        } catch (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    /**
     * Mark a notification as read
     */
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;

            const notification = await NotificationService.markAsRead(id);

            res.status(200).json({ message: 'Notification marked as read', notification });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    /**
     * Get all notifications for a specific receiver
     */
    static async getNotificationsByReceiver(req, res) {
        try {
            const { receiverId } = req.params;

            const notifications = await NotificationService.getNotificationsByReceiver(receiverId);

            res.status(200).json({ notifications });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = NotificationController;