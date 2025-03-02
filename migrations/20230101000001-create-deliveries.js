'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Deliveries', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      deliveryPartnerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'DeliveryPartners',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subscriptionId: {
        type: Sequelize.UUID,
        allowNull: false,
        // Uncomment the below lines if a Subscriptions table exists
        // references: {
        //   model: 'Subscriptions',
        //   key: 'id',
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'CASCADE',
      },
      deliveryAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deliveryTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Assigned', 'Completed'),
        defaultValue: 'Assigned',
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Deliveries');
  },
};
