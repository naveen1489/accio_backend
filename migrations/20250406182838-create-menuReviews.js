'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('MenuReviews', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            menuId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Menus',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            restaurantId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Restaurants',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            status: {
                type: Sequelize.ENUM('Pending', 'Approved', 'Declined'),
                allowNull: false,
                defaultValue: 'Pending'
            },
            adminComment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('MenuReviews');
    }
};