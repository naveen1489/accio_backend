const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication APIs
 */

/**
 * @swagger
 * /api/users/register-admin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: "admin123"
 *             password: "securepassword"
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/register-admin', userController.registerAdmin);

/**
 * @swagger
 * /api/users/login-admin:
 *   post:
 *     summary: Login as an admin
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: "admin123"
 *             password: "securepassword"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/login-admin', userController.loginAdmin);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change password for the logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *           example:
 *             oldPassword: "oldpassword123"
 *             newPassword: "newsecurepassword"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/change-password', authenticateToken, userController.changePassword);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the profile of the logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authenticateToken, userController.getProfile);

/**
 * @swagger
 * /api/users/login-restaurant:
 *   post:
 *     summary: Login as a restaurant partner
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: "restaurant123"
 *             password: "securepassword"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/login-restaurant', userController.loginRestaurant);

/**
 * @swagger
 * /api/users/login-delivery:
 *   post:
 *     summary: Login as a delivery partner via OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *           example:
 *             phone: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Delivery partner not found
 *       500:
 *         description: Internal server error
 */
router.post('/login-delivery', userController.loginDeliveryPartner);

/**
 * @swagger
 * /api/users/restaurant/send-otp:
 *   post:
 *     summary: Send OTP to a restaurant partner
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *           example:
 *             phone: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       500:
 *         description: Internal server error
 */
router.post('/restaurant/send-otp', userController.sendOtp);

/**
 * @swagger
 * /api/users/restaurant/verify-otp:
 *   post:
 *     summary: Verify OTP for a restaurant partner
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *           example:
 *             phone: "9876543210"
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Internal server error
 */
router.post('/restaurant/verify-otp', userController.verifyOtp);

/**
 * @swagger
 * /api/users/restaurant/reset-password:
 *   post:
 *     summary: Reset password for a restaurant partner
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *           example:
 *             username: "restaurant123"
 *             newPassword: "newsecurepassword"
 *             confirmPassword: "newsecurepassword"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/restaurant/reset-password', userController.resetPassword);

module.exports = router;