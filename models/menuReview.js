'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MenuReview extends Model {
        static associate(models) {
            // A MenuReview belongs to a Menu
            MenuReview.belongsTo(models.Menu, { foreignKey: 'menuId', as: 'menu' });

            // A MenuReview belongs to a Restaurant
            MenuReview.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
        }
    }

    MenuReview.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        menuId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        restaurantId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Declined'),
            allowNull: false,
            defaultValue: 'Pending'
        },
        adminComment: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'MenuReview',
    });

    return MenuReview;
};