'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // It's good practice to wrap these in a transaction
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Restaurants', 'closeStartDate', { transaction });
      await queryInterface.removeColumn('Restaurants', 'closeEndDate', { transaction });

      await queryInterface.addColumn('Restaurants', 'closeDays', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // The 'down' migration should reverse the 'up' migration
    await queryInterface.removeColumn('Restaurants', 'closeDays');
    await queryInterface.addColumn('Restaurants', 'closeStartDate', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('Restaurants', 'closeEndDate', { type: Sequelize.DATE, allowNull: true });
  },
};  