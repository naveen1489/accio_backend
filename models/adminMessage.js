'use strict';
module.exports = (sequelize, DataTypes) => {
  const AdminMessage = sequelize.define(
    'AdminMessage',
    {id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUIDV4,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      emailId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userRole: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {}
  );

  AdminMessage.associate = function (models) {
    // Define associations here if needed
  };

  return AdminMessage;
};