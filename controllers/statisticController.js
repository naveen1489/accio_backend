'use strict';

const { Restaurant, Subscription, sequelize } = require('../models');
const { Op } = require('sequelize');

class StatisticController {
    /**
     * Get total restaurant partners
     */
    static async getTotalRestaurantPartners(req, res) {
        try {
            const totalPartners = await Restaurant.count();
            res.status(200).json({ totalPartners });
        } catch (error) {
            console.error('Error fetching total restaurant partners:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    /**
     * Get total subscribers for restaurant partners
     */
    static async getTotalSubscribers(req, res) {
        try {
            const totalSubscribers = await Subscription.count();
            res.status(200).json({ totalSubscribers });
        } catch (error) {
            console.error('Error fetching total subscribers:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    /**
     * Get day-wise new subscribers for this month
     */
    static async getDayWiseNewSubscribers(req, res) {
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
    }

    /**
     * Get day-wise new restaurant partners for this month
     */
    static async getDayWiseNewPartners(req, res) {
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
    }
}

module.exports = StatisticController;