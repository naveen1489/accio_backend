'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeliveryPartner extends Model {
    static associate(models) {
      // A DeliveryPartner belongs to a Restaurant
      DeliveryPartner.belongsTo(models.Restaurant, {
        foreignKey: 'restaurantId',
        as: 'restaurant',
      });
      // A DeliveryPartner can have many Deliveries
      DeliveryPartner.hasMany(models.Delivery, {
        foreignKey: 'deliveryPartnerId',
        as: 'deliveries',
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
        allowNull: true, // Email is now optional
        unique: true,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure phone numbers are unique
        validate: { isNumeric: true },
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'inactive', // Default status is inactive
      },
      workingHoursStart: {
        type: DataTypes.TIME, // Store time in HH:MM:SS format
        allowNull: true,
      },
      workingHoursEnd: {
        type: DataTypes.TIME, // Store time in HH:MM:SS format
        allowNull: true,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false, // Foreign key to the Restaurants table
      },
    },
    {
      sequelize,
      modelName: 'DeliveryPartner',
    }
  );

  return DeliveryPartner;
};