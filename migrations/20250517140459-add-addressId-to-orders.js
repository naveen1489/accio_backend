'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add addressId column to the Orders table
    await queryInterface.addColumn('Orders', 'addressId', {
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
    // Remove addressId column from the Orders table
    await queryInterface.removeColumn('Orders', 'addressId');
  },
};