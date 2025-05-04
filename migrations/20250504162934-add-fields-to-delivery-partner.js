'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DeliveryPartners', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'inactive',
    });
    await queryInterface.addColumn('DeliveryPartners', 'workingHoursStart', {
      type: Sequelize.TIME,
      allowNull: true,
    });
    await queryInterface.addColumn('DeliveryPartners', 'workingHoursEnd', {
      type: Sequelize.TIME,
      allowNull: true,
    });
    await queryInterface.changeColumn('DeliveryPartners', 'email', {
      type: Sequelize.STRING,
      allowNull: true, // Make email optional
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('DeliveryPartners', 'status');
    await queryInterface.removeColumn('DeliveryPartners', 'workingHoursStart');
    await queryInterface.removeColumn('DeliveryPartners', 'workingHoursEnd');
    await queryInterface.changeColumn('DeliveryPartners', 'email', {
      type: Sequelize.STRING,
      allowNull: false, // Revert email to mandatory
    });
  },
};