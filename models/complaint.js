'use strict';
module.exports = (sequelize, DataTypes) => {
  const Complaint = sequelize.define(
    'Complaint',
    {id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      menuId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      consumerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      complaintMessage: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending', // Default status
      },
      imageUrls: {
  type: DataTypes.JSON, // Assuming image URLs are stored as an array of strings
  allowNull: true,
},
comment: {
  type: DataTypes.TEXT, // For storing comments
  allowNull: true,
},
    },
    {}
  );

  Complaint.associate = function (models) {
    // Define associations here if needed
    Complaint.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    Complaint.belongsTo(models.Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
    Complaint.belongsTo(models.Menu, { foreignKey: 'menuId', as: 'menu' });
    Complaint.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    Complaint.belongsTo(models.Consumer, { foreignKey: 'consumerId', as: 'consumer' });
  };

  return Complaint;
};