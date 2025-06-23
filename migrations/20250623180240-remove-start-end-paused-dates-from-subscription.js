'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Subscriptions');

    if (tableDescription.pausedAt) {
      await queryInterface.removeColumn('Subscriptions', 'pausedAt');
    }

    if (tableDescription.pausedEndDate) {
      await queryInterface.removeColumn('Subscriptions', 'pausedEndDate');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Subscriptions', 'pausedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Subscriptions', 'pausedEndDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};