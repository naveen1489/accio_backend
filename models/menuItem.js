'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MenuItem extends Model {
        static associate(models) {
            // A MenuItem belongs to a MenuCategory
            MenuItem.belongsTo(models.MenuCategory, { foreignKey: 'menuCategoryId', as: 'menuCategory' });
        }
    }

    MenuItem.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        menuCategoryId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        itemCategory: { // New field
            type: DataTypes.STRING,
            allowNull: true // Set to true if this field is optional
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'MenuItem',
    });

    return MenuItem;
};