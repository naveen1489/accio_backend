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
 * /api/users/send-otp:
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
router.post('/send-otp', userController.sendOtp);

/**
 * @swagger
 * /api/users/verify-otp:
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
router.post('/verify-otp',authenticateToken, userController.verifyOtp);



/**
 * @swagger
 * /api/users/consumer/signup/verify-otp:
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
router.post('/consumer/signup/verify-otp',authenticateToken, userController.verifyOtpForConsumerSignup);



/**
 * @swagger
 * /api/users/reset-password:
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
router.post('/reset-password', authenticateToken, userController.resetPassword);


/**
 * @swagger
 * /api/admin/message:
 *   post:
 *     summary: Send a message to the admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message to send
 *               emailId:
 *                 type: string
 *                 description: Email ID of the sender
 *           example:
 *             message: "I need help with my subscription."
 *             emailId: "user@example.com"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/admin/message', authenticateToken, userController.sendMessageToAdmin);

/**
 * @swagger
 * /admin/messages:
 *   get:
 *     summary: Get all messages sent to the admin
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of messages per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Messages fetched successfully
 *                 totalMessages:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: string
 *                       message:
 *                         type: string
 *                       emailId:
 *                         type: string
 *                       userRole:
 *                         type: string
 *                       name:
 *                         type: string
 *                       personalDetails:
 *                         type: object
 *                         properties:
 *                           mobile:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profilePic:
 *                             type: string
 *       500:
 *         description: Internal server error
 */
router.get('/admin/messages',authenticateToken, getMessagesToAdmin);

module.exports = router;