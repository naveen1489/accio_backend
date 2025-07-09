'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Complaints', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
         defaultValue: Sequelize.UUIDV4,
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      subscriptionId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      menuId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      restaurantId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      consumerId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      complaintMessage: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Complaints');
  },
};