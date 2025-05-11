'use strict';

const express = require('express');
const router = express.Router();
const StatisticController = require('../controllers/statisticController');
const authenticateToken = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: APIs for fetching various statistics
 */

/**
 * @swagger
 * /api/statistics/total-restaurant-partners:
 *   get:
 *     summary: Get the total number of restaurant partners
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Total restaurant partners fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPartners:
 *                   type: integer
 *             example:
 *               totalPartners: 25
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/total-restaurant-partners', authenticateToken, StatisticController.getTotalRestaurantPartners);

/**
 * @swagger
 * /api/statistics/total-subscribers:
 *   get:
 *     summary: Get the total number of subscribers
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Total subscribers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSubscribers:
 *                   type: integer
 *             example:
 *               totalSubscribers: 100
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/total-subscribers', authenticateToken, StatisticController.getTotalSubscribers);

/**
 * @swagger
 * /api/statistics/day-wise-new-subscribers:
 *   get:
 *     summary: Get day-wise new subscribers for the current month
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Day-wise new subscribers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dayWiseSubscribers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       count:
 *                         type: integer
 *             example:
 *               dayWiseSubscribers:
 *                 - date: "2025-05-01"
 *                   count: 5
 *                 - date: "2025-05-02"
 *                   count: 10
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/day-wise-new-subscribers', authenticateToken, StatisticController.getDayWiseNewSubscribers);

/**
 * @swagger
 * /api/statistics/day-wise-new-partners:
 *   get:
 *     summary: Get day-wise new restaurant partners for the current month
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Day-wise new restaurant partners fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dayWisePartners:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       count:
 *                         type: integer
 *             example:
 *               dayWisePartners:
 *                 - date: "2025-05-01"
 *                   count: 2
 *                 - date: "2025-05-02"
 *                   count: 3
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/day-wise-new-partners', authenticateToken, StatisticController.getDayWiseNewPartners);

/**
 * @swagger
 * /api/statistics/all-statistics:
 *   get:
 *     summary: Get all statistics in a single response
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: All statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPartners:
 *                   type: integer
 *                 totalSubscribers:
 *                   type: integer
 *                 dayWisePartners:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       count:
 *                         type: integer
 *                 totalRevenue:
 *                   type: number
 *             example:
 *               totalPartners: 25
 *               totalSubscribers: 100
 *               dayWisePartners:
 *                 - date: "2025-05-01"
 *                   count: 2
 *                 - date: "2025-05-02"
 *                   count: 3
 *               totalRevenue: 5000
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/all-statistics', authenticateToken, StatisticController.getAllStatistics);

module.exports = router;