'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DeliveryPartners', 'userId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Make sure this matches your actual users table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('DeliveryPartners', 'userId');
  }
};