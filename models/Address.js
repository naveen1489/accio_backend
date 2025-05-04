'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      // An Address belongs to a Consumer
      Address.belongsTo(models.Consumer, { foreignKey: 'consumerId', as: 'consumer' });
    }
  }

  Address.init(
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
      addressTag: {
        type: DataTypes.STRING, // E.g., "home", "office", "other"
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING, // Only required if addressTag is "other"
        allowNull: true,
      },
      addressLine1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      addressLine2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isNumeric: true },
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Address',
    }
  );

  return Address;
};