'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('MenuItems', 'itemCategory', {
            type: Sequelize.STRING,
            allowNull: true // Set to true if this field is optional
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('MenuItems', 'itemCategory');
    }
};