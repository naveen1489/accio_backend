'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('MenuCategories', 'day', {
            type: Sequelize.STRING,
            allowNull: false, // Set to false if this field is required
            validate: {
                isIn: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']]
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('MenuCategories', 'day');
    }
};