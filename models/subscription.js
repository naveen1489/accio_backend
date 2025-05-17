'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // A Subscription belongs to a Consumer (the customer)
      Subscription.belongsTo(models.Consumer, { foreignKey: 'consumerId', as: 'customer' });
      // A Subscription belongs to a Restaurant (the partner providing the meals)
      Subscription.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
      // A Subscription belongs to a Menu
      Subscription.belongsTo(models.Menu, { foreignKey: 'menuId', as: 'menu' });
    }
  }

  Subscription.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      consumerId: {
        type: DataTypes.UUID,
        allowNull: false, // Foreign key to the Consumer table
        references: {
          model: 'Consumers',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false, // Foreign key to the Restaurant table
      },
      menuId: {
        type: DataTypes.UUID,
        allowNull: false, // Foreign key to the Menu table
      },
      categoryName: {
        type: DataTypes.STRING,
        allowNull: false, // E.g., "Vegetarian", "Non-Vegetarian", etc.
      },
      mealPlan: {
        type: DataTypes.ENUM('weekly', 'monthly'),
        allowNull: false, // E.g., "weekly" or "monthly"
      },
      mealFrequency: {
        type: DataTypes.ENUM('daily', 'alternate', 'custom'),
        allowNull: false, // E.g., "daily", "alternate days", or "custom"
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'rejected', 'approved', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      pausedAt: {
        type: DataTypes.DATE,
        allowNull: true, // This field is set when the subscription is paused
      },
      pauseEndDate: {
        type: DataTypes.DATE,
        allowNull: true, // This field is set when the subscription is paused
      },
      paymentAmount: {
        type: DataTypes.FLOAT, // Payment amount as a floating-point number
        allowNull: false,
        defaultValue: 0.0, // Default value for payment amount
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'), // Payment status options
        allowNull: false,
        defaultValue: 'pending', // Default payment status
      },
      addressId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null initially
        references: {
          model: 'Addresses', // Reference the Addresses table
          key: 'id',
        },
        onDelete: 'SET NULL', // If the address is deleted, set this field to null
      },
    },
    {
      sequelize,
      modelName: 'Subscription',
    }
  );

  return Subscription;
};