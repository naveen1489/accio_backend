'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ItemCategory extends Model {
        static associate(models) {
            // An ItemCategory belongs to a Category
            ItemCategory.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });

            // An ItemCategory has many Items
            ItemCategory.hasMany(models.Item, { foreignKey: 'itemCategoryId', as: 'items' });
        }
    }

    ItemCategory.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        itemCategoryName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'ItemCategory',
    });

    return ItemCategory;
};