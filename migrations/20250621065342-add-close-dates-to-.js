'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'closeStartDate', {
      type: Sequelize.DATE,
      allowNull: true, // Allow null if the restaurant doesn't have closure dates
    });
    await queryInterface.addColumn('Restaurants', 'closeEndDate', {
      type: Sequelize.DATE,
      allowNull: true, // Allow null if the restaurant doesn't have closure dates
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'closeStartDate');
    await queryInterface.removeColumn('Restaurants', 'closeEndDate');
  },
};