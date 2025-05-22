'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'userId', {
      type: Sequelize.UUID,
      allowNull: true, // Allow null initially for backfilling
      references: {
        model: 'Users', // Reference the Users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'userId');
  },
};