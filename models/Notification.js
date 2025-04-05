'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Notification extends Model {}

    Notification.init({
        NotificationId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ReceiverId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        SenderId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        NotificationMessage: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        NotificationType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        NotificationMetadata: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        Status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'unread',
        },
    }, {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true,
    });

    return Notification;
};