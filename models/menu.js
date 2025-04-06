'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Menu extends Model {
        static associate(models) {
            // A Menu belongs to a Restaurant
            Menu.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

            // A Menu has many MenuCategories
            Menu.hasMany(models.MenuCategory, { foreignKey: 'menuId', as: 'menuCategories' });
        }
    }

    Menu.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        menuName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        vegNonVeg: {
            type: DataTypes.ENUM('Veg', 'NonVeg'),
            allowNull: false
        },
        restaurantId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        status: { // New field
            type: DataTypes.ENUM('Pending', 'Approved', 'Declined'),
            allowNull: false,
            defaultValue: 'Pending' // Default value
        },
        price: { // New field
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 0 // Ensure price is non-negative
            }
        }

    }, {
        sequelize,
        modelName: 'Menu',
    });

    return Menu;
};