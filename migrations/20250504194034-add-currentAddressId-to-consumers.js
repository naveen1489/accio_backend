'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Consumers', 'currentAddressId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Addresses', // Reference the Address table
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Consumers', 'currentAddressId');
  },
};