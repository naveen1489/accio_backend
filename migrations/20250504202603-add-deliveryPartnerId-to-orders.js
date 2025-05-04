'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'deliveryPartnerId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'DeliveryPartners', // Reference the DeliveryPartners table
        key: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'deliveryPartnerId');
  },
};