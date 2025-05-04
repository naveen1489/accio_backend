'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Consumer extends Model {
    static associate(models) {
      // A Consumer belongs to a User
      Consumer.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Consumer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false, // Foreign key to the User table
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isNumeric: true },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      profilePic: {
        type: DataTypes.STRING, // URL or file path for the profile picture
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'Consumer',
    }
  );

  return Consumer;
};