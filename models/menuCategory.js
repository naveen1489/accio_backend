'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MenuCategory extends Model {
        static associate(models) {
            // A MenuCategory belongs to a Menu
            MenuCategory.belongsTo(models.Menu, { foreignKey: 'menuId', as: 'menu' });

            // A MenuCategory has many MenuItems
            MenuCategory.hasMany(models.MenuItem, { foreignKey: 'menuCategoryId', as: 'menuItems' });
        }
    }

    MenuCategory.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        menuId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        day: { // New field
            type: DataTypes.STRING,
            allowNull: false, // Set to false if this field is required
            validate: {
                isIn: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']] // Restrict to valid days
            }
        }
    }, {
        sequelize,
        modelName: 'MenuCategory',
    });

    return MenuCategory;
};