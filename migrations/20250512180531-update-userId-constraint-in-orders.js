'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the incorrect foreign key constraint
    await queryInterface.removeConstraint('Orders', 'Orders_userId_fkey');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the incorrect foreign key constraint (if needed)
    await queryInterface.addConstraint('Orders', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Orders_userId_fkey',
      references: {
        table: 'Users', // Revert to the incorrect table
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
};