'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            // A Category has many ItemCategories
            Category.hasMany(models.ItemCategory, { foreignKey: 'categoryId', as: 'itemCategories' });
        }
    }

    Category.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        vegNonVeg: {
            type: DataTypes.ENUM('Veg', 'NonVeg'),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Category',
    });

    return Category;
};