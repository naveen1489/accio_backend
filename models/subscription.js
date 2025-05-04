'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // A Subscription belongs to a User (the customer)
      Subscription.belongsTo(models.User, { foreignKey: 'userId', as: 'customer' });
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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      menuId: {
        type: DataTypes.UUID,
        allowNull: false, // Link to the Menu table
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
        type: DataTypes.ENUM('active', 'paused', 'cancelled'),
        defaultValue: 'active',
      },
      pausedAt: {
        type: DataTypes.DATE,
        allowNull: true, // This field is set when the subscription is paused
      },
      pauseEndDate: {
        type: DataTypes.DATE,
        allowNull: true, // This field is set when the subscription is paused
      },
    },
    {
      sequelize,
      modelName: 'Subscription',
    }
  );

  return Subscription;
};