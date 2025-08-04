'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Restaurant extends Model {
        static associate(models) {
            // Define associations here if needed
            Restaurant.belongsTo(models.User, { foreignKey: 'userId', as: 'user' }); // Association with User
        }
    }

    Restaurant.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        companyName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nameTitle: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        countryCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contactNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        emailId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        addressLine1: {
            type: DataTypes.STRING,
            allowNull: false
        },
        addressLine2: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.TEXT, 
            allowNull: false,
        },
        closeDays: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [], // e.g., ["saturday", "sunday"] or specific dates ["2024-12-25"]
        },
        userId: { // New column
            type: DataTypes.UUID,
            allowNull: true, // Initially allow null for backfilling
            references: {
                model: 'Users', // Reference the Users table
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        }
    }, {
        sequelize,
        modelName: 'Restaurant',
    });

    return Restaurant;
};