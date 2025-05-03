'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OTP extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  OTP.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'OTP',
    }
  );
  return OTP;
};