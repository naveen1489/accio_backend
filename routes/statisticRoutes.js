'use strict';

const express = require('express');
const router = express.Router();
const StatisticController = require('../controllers/statisticController');
const authenticateToken = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware

// Get total restaurant partners
router.get('/total-restaurant-partners', authenticateToken, StatisticController.getTotalRestaurantPartners);

// Get total subscribers for restaurant partners
router.get('/total-subscribers', authenticateToken, StatisticController.getTotalSubscribers);

// Get day-wise new subscribers for this month
router.get('/day-wise-new-subscribers', authenticateToken, StatisticController.getDayWiseNewSubscribers);

// Get day-wise new restaurant partners for this month
router.get('/day-wise-new-partners', authenticateToken, StatisticController.getDayWiseNewPartners);

module.exports = router;