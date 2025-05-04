'use strict';

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authenticateToken = require('../middlewares/authMiddleware');

// Create a new subscription
router.post('/create', authenticateToken, subscriptionController.createSubscription);

// Update an existing subscription
router.put('/update/:id', authenticateToken, subscriptionController.updateSubscription);



// Update subscription status
router.patch('/:id/status', subscriptionController.updateSubscriptionStatus);

// Get subscriptions by menu ID
router.get('/menu/:menuId', subscriptionController.getSubscriptionsByMenuId);

// Get subscriptions by restaurant ID
router.get('/restaurant/:restaurantId', subscriptionController.getSubscriptionsByRestaurantId);

// Get subscriptions by user ID
router.get('/user/:userId', subscriptionController.getSubscriptionsByUserId);

// Get subscription by ID
router.get('/:id', subscriptionController.getSubscriptionById);

module.exports = router;
