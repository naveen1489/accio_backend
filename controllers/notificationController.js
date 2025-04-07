'use strict';
const jwt = require('jsonwebtoken');
const { Notification } = require('../models');

exports.getNotificationsByReceiver = async (req, res) => {
    console.log('Fetching notifications for receiver:', req.params.receiverId); // Debugging line
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
        return res.status(401).json({ message: 'Authorization token missing' });
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        

        const receiverId = decoded.id;
        //const { receiverId } = req.params;
        console.log('Receiver ID:', receiverId); // Debugging line
        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }
        const notifications = await Notification.findAll({
            where: { ReceiverId: receiverId },
            order: [['createdAt', 'DESC']], // Sort by most recent
        });
        res.status(200).json(notifications);
        //return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw new Error('Failed to fetch notifications');
    }
};
