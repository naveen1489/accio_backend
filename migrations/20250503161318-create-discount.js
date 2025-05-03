'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Discounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      menuId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Menus', // Reference the Menu table
          key: 'id',
        },
        onDelete: 'CASCADE', // Delete discount if the menu is deleted
      },
      discountEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      discountType: {
        type: Sequelize.ENUM('percentage', 'amount'),
        allowNull: true,
      },
      discountValue: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      discountStartDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      discountEndDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Discounts');
  },
};