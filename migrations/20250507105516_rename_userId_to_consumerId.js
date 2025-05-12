'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Subscriptions', 'userId', 'consumerId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Subscriptions', 'consumerId', 'userId');
  },
};