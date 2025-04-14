'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'imageUrl', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'imageUrl');
  },
};
 