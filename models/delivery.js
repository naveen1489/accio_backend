'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    static associate(models) {
      // A Delivery belongs to a DeliveryPartner
      Delivery.belongsTo(models.DeliveryPartner, {
        foreignKey: 'deliveryPartnerId',
        as: 'deliveryPartner',
      });
      // A Delivery also belongs to a Subscription (if a Subscription model exists)
      Delivery.belongsTo(models.Subscription, {
        foreignKey: 'subscriptionId',
        as: 'subscription',
      });
    }
  }

  Delivery.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      deliveryPartnerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deliveryTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Assigned', 'Completed'),
        defaultValue: 'Assigned',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Delivery',
    }
  );

  return Delivery;
};
