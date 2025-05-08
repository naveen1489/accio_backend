'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Menus', 'imageUrl', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Menus', 'imageUrl');
  }
};

 