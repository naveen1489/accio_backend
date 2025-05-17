'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add addressId column to the Subscriptions table
    await queryInterface.addColumn('Subscriptions', 'addressId', {
      type: Sequelize.UUID,
      allowNull: true, // Allow null initially
      references: {
        model: 'Addresses', // Reference the Addresses table
        key: 'id',
      },
      onDelete: 'SET NULL', // If the address is deleted, set this field to null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove addressId column from the Subscriptions table
    await queryInterface.removeColumn('Subscriptions', 'addressId');
  },
};