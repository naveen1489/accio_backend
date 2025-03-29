'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Item extends Model {
        static associate(models) {
            // An Item belongs to an ItemCategory
            Item.belongsTo(models.ItemCategory, { foreignKey: 'itemCategoryId', as: 'itemCategory' });
        }
    }

    Item.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        itemCategoryId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Item',
    });

    return Item;
};