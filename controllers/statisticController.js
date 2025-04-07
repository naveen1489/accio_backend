'use strict';

const { Restaurant, Subscription, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get total restaurant partners
const getTotalRestaurantPartners = async (req, res) => {
    try {
        const totalPartners = await Restaurant.count();
        res.status(200).json({ totalPartners });
    } catch (error) {
        console.error('Error fetching total restaurant partners:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get total subscribers for restaurant partners
const getTotalSubscribers = async (req, res) => {
    try {
        const totalSubscribers = await Subscription.count();
        res.status(200).json({ totalSubscribers });
    } catch (error) {
        console.error('Error fetching total subscribers:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get day-wise new subscribers for this month
const getDayWiseNewSubscribers = async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const dayWiseSubscribers = await Subscription.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        res.status(200).json({ dayWiseSubscribers });
    } catch (error) {
        console.error('Error fetching day-wise new subscribers:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get day-wise new restaurant partners for this month
const getDayWiseNewPartners = async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const dayWisePartners = await Restaurant.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        res.status(200).json({ dayWisePartners });
    } catch (error) {
        console.error('Error fetching day-wise new partners:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get all statistics data
// Get all statistics data
const getAllStatistics = async (req, res) => {
    try {
        // Get total restaurant partners
        const totalPartners = await Restaurant.count();

        // Get total subscribers
        const totalSubscribers = await Subscription.count();

        // Get the last 10 days, including today, in local time
        const today = new Date();
        const last10Days = Array.from({ length: 10 }, (_, i) => {
            const date = new Date(today); // Clone the current date
            date.setDate(today.getDate() - (9 - i)); // Adjust to include today as the last day
            return date.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD in local time
        });

        // Get day-wise new restaurant partners for the last 10 days
        const dayWisePartnersRaw = await Restaurant.findAll({
            attributes: [
                [sequelize.literal(`DATE("createdAt" AT TIME ZONE 'Asia/Kolkata')`), 'date'], // Adjust for time zone
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: {
                    [Op.between]: [
                        `${last10Days[0]} 00:00:00+05:30`,
                        `${last10Days[last10Days.length - 1]} 23:59:59+05:30`
                    ]
                }
            },
            group: [sequelize.literal(`DATE("createdAt" AT TIME ZONE 'Asia/Kolkata')`)],
            order: [[sequelize.literal(`DATE("createdAt" AT TIME ZONE 'Asia/Kolkata')`), 'ASC']]
        });

        // Map raw data to a dictionary for easy lookup
        const dayWisePartnersMap = dayWisePartnersRaw.reduce((acc, record) => {
            acc[record.dataValues.date] = parseInt(record.dataValues.count, 10);
            return acc;
        }, {});

        // Fill missing days with 0
        const dayWisePartners = last10Days.map((date) => ({
            date,
            count: dayWisePartnersMap[date] || 0
        }));

        // Combine all statistics into a single JSON response
        res.status(200).json({
            totalPartners,
            totalSubscribers,
            dayWisePartners,
            totalRevenue: 0 // Hardcoded total revenue
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
module.exports = {
    getTotalRestaurantPartners,
    getTotalSubscribers,
    getDayWiseNewSubscribers,
    getDayWiseNewPartners,
    getAllStatistics
};