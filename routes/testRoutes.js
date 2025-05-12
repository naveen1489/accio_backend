const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

/**
 * @swagger
 * tags:
 *   name: Test
 *   description: APIs for testing and development purposes
 */

/**
 * @swagger
 * /api/test/users:
 *   get:
 *     summary: Get all users (Test API)
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *             example:
 *               message: "Users fetched successfully"
 *               users:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   username: "john_doe"
 *                   email: "john@example.com"
 *                 - id: "456e7890-e89b-12d3-a456-426614174001"
 *                   username: "jane_doe"
 *                   email: "jane@example.com"
 *       500:
 *         description: Internal server error
 */
router.get('/users', testController.getAllUsers);

module.exports = router;