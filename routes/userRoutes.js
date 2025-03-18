const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

// Admin routes
router.post('/register-admin', userController.registerAdmin);
router.post('/login-admin', userController.loginAdmin);
router.post('/change-password', authenticateToken, userController.changePassword);
router.get('/profile', authenticateToken, userController.getProfile);

// Login route for Restaurant Partners
router.post('/login-restaurant', userController.loginRestaurant);

// Login route for Delivery Partners
router.post('/login-delivery', userController.loginDeliveryPartner);

module.exports = router;
