'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the constraint exists before attempting to remove it
    const constraints = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'Subscriptions' AND constraint_name = 'Subscriptions_userId_fkey';
    `);

    if (constraints[0].length > 0) {
      // If the constraint exists, remove it
      await queryInterface.removeConstraint('Subscriptions', 'Subscriptions_userId_fkey');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the incorrect foreign key constraint (if needed)
    await queryInterface.addConstraint('Subscriptions', {
      fields: ['consumerId'],
      type: 'foreign key',
      name: 'Subscriptions_userId_fkey', // Revert to the incorrect constraint
      references: {
        table: 'Users', // Revert to the incorrect table
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
};