'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add paymentAmount column
    await queryInterface.addColumn('Subscriptions', 'paymentAmount', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0, // Default value for existing records
    });

    // Add paymentStatus column
    await queryInterface.addColumn('Subscriptions', 'paymentStatus', {
      type: Sequelize.ENUM('pending', 'paid', 'failed'),
      allowNull: false,
      defaultValue: 'pending', // Default value for existing records
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove paymentAmount column
    await queryInterface.removeColumn('Subscriptions', 'paymentAmount');

    // Remove paymentStatus column
    await queryInterface.removeColumn('Subscriptions', 'paymentStatus');
  },
};