'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Menus', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            menuName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            vegNonVeg: {
                type: Sequelize.ENUM('Veg', 'NonVeg'),
                allowNull: false
            },
            restaurantId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Restaurants', // Ensure this matches the name of your Restaurants table
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Menus');
    }
};