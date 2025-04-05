'use strict';

const Notification = require('../models/Notification');

class NotificationService {
    /**
     * Create a new notification
     * @param {Object} notificationData - The data for the notification
     * @param {UUID} notificationData.ReceiverId - The ID of the receiver
     * @param {UUID} notificationData.SenderId - The ID of the sender
     * @param {String} notificationData.NotificationMessage - The notification message
     * @param {String} notificationData.NotificationType - The type of notification (e.g., "info", "warning", "success")
     * @param {Object} [notificationData.NotificationMetadata] - Optional metadata for the notification
     * @returns {Promise<Object>} - The created notification
     */
    static async createNotification(notificationData) {
        try {
            const notification = await Notification.create({
                ReceiverId: notificationData.ReceiverId,
                SenderId: notificationData.SenderId,
                NotificationMessage: notificationData.NotificationMessage,
                NotificationType: notificationData.NotificationType,
                NotificationMetadata: notificationData.NotificationMetadata || null,
                Status: 'unread', // Default status is 'unread'
            });

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw new Error('Failed to create notification');
        }
    }

    /**
     * Mark a notification as read
     * @param {UUID} notificationId - The ID of the notification to mark as read
     * @returns {Promise<Object>} - The updated notification
     */
    static async markAsRead(notificationId) {
        try {
            const notification = await Notification.findByPk(notificationId);
            if (!notification) {
                throw new Error('Notification not found');
            }

            notification.Status = 'read';
            await notification.save();

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error('Failed to mark notification as read');
        }
    }

    /**
     * Get all notifications for a specific receiver
     * @param {UUID} receiverId - The ID of the receiver
     * @returns {Promise<Array>} - List of notifications
     */
    static async getNotificationsByReceiver(receiverId) {
        try {
            const notifications = await Notification.findAll({
                where: { ReceiverId: receiverId },
                order: [['createdAt', 'DESC']], // Sort by most recent
            });

            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw new Error('Failed to fetch notifications');
        }
    }
}

module.exports = NotificationService;