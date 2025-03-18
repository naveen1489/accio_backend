'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // A Subscription belongs to a User (the customer)
      Subscription.belongsTo(models.User, { foreignKey: 'userId', as: 'customer' });
      // A Subscription belongs to a Restaurant (the partner providing the meals)
      Subscription.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    }
  }

  Subscription.init({
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
    mealPlanType: {
      type: DataTypes.ENUM('breakfast', 'lunch', 'dinner'),
      allowNull: false,
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
    // Additional fields (e.g., delivery details) can be added here if needed.
  }, {
    sequelize,
    modelName: 'Subscription',
  });

  return Subscription;
};
