'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add fields to the Complaint table
    await queryInterface.addColumn('Complaints', 'imageUrls', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('Complaints', 'comment', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove fields from the Complaint table
    await queryInterface.removeColumn('Complaints', 'imageUrls');
    await queryInterface.removeColumn('Complaints', 'comment');
  },
};