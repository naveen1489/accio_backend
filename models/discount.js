'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Discount extends Model {
    static associate(models) {
      // A Discount belongs to a Menu
      Discount.belongsTo(models.Menu, { foreignKey: 'menuId', as: 'menu' });
    }
  }

  Discount.init(
    {
      menuId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      discountEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      discountType: {
        type: DataTypes.ENUM('percentage', 'amount'),
        allowNull: true,
      },
      discountValue: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      discountStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      discountEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Discount',
    }
  );

  return Discount;
};