'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'imageUrls', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('Restaurants', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'imageUrls');
    await queryInterface.removeColumn('Restaurants', 'comment');
  },
};