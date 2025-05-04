'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields
    await queryInterface.addColumn('Subscriptions', 'menuId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Menus',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
    await queryInterface.addColumn('Subscriptions', 'categoryName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Subscriptions', 'mealPlan', {
      type: Sequelize.ENUM('weekly', 'monthly'),
      allowNull: false,
    });
    await queryInterface.addColumn('Subscriptions', 'mealFrequency', {
      type: Sequelize.ENUM('daily', 'alternate', 'custom'),
      allowNull: false,
    });

    // Remove the mealPlanType field
    await queryInterface.removeColumn('Subscriptions', 'mealPlanType');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes
    await queryInterface.removeColumn('Subscriptions', 'menuId');
    await queryInterface.removeColumn('Subscriptions', 'categoryName');
    await queryInterface.removeColumn('Subscriptions', 'mealPlan');
    await queryInterface.removeColumn('Subscriptions', 'mealFrequency');
    await queryInterface.addColumn('Subscriptions', 'mealPlanType', {
      type: Sequelize.ENUM('breakfast', 'lunch', 'dinner'),
      allowNull: false,
    });
  },
};