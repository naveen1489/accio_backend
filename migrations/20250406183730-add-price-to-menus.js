'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Menus', 'price', {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0, // Default value for existing rows
            validate: {
                min: 0 // Ensure price is non-negative
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Menus', 'price');
    }
};