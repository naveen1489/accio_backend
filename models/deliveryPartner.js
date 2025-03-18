'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeliveryPartner extends Model {
    static associate(models) {
      // A DeliveryPartner belongs to a Restaurant (assuming a Restaurant model exists)
      DeliveryPartner.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant'
      });
      // A DeliveryPartner can have many Deliveries
      DeliveryPartner.hasMany(models.Delivery, {
        foreignKey: 'deliveryPartnerId',
        as: 'deliveries'
      });
    }
  }

  DeliveryPartner.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isNumeric: true },
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        // This is a foreign key to the Restaurants table
      },
    },
    {
      sequelize,
      modelName: 'DeliveryPartner',
    }
  );

  return DeliveryPartner;
};
