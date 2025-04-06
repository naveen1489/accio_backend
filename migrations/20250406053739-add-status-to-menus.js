'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Menus', 'status', {
            type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
            allowNull: false,
            defaultValue: 'Pending'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Menus', 'status');
    }
};