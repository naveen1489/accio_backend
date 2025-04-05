'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      NotificationId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      ReceiverId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      SenderId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      NotificationMessage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      NotificationType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      NotificationMetadata: {
        type: Sequelize.JSON, // Storing metadata as JSON
        allowNull: true, // Optional field
      },
      Status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'unread', // Default status is 'unread'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
  },
};