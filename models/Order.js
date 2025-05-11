'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // An Order belongs to a Subscription
      Order.belongsTo(models.Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
      // An Order belongs to a User
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // An Order belongs to a Restaurant
      Order.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
      // An Order belongs to a Menu
      Order.belongsTo(models.Menu, { foreignKey: 'menuId', as: 'menu' });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
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
        allowNull: false,
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deliveryPartnerId: {
        type: DataTypes.UUID,
        allowNull: true, // Initially null until assigned
        references: {
          model: 'DeliveryPartners', // Reference the DeliveryPartners table
          key: 'id',
        },
        onDelete: 'SET NULL', // If the delivery partner is deleted, set this field to null
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'assigned'),
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Order',
    }
  );

  return Order;
};