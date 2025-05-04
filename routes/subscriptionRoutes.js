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
router.patch('/subscriptions/:id/status', subscriptionController.updateSubscriptionStatus);

// Get subscriptions by menu ID
router.get('/subscriptions/menu/:menuId', subscriptionController.getSubscriptionsByMenuId);

// Get subscriptions by restaurant ID
router.get('/subscriptions/restaurant/:restaurantId', subscriptionController.getSubscriptionsByRestaurantId);

// Get subscriptions by user ID
router.get('/subscriptions/user/:userId', subscriptionController.getSubscriptionsByUserId);

// Get subscription by ID
router.get('/subscriptions/:id', subscriptionController.getSubscriptionById);

// Pause subscription
router.patch('/subscriptions/:id/pause', subscriptionController.pauseSubscription);

// Resume subscription
router.patch('/subscriptions/:id/resume', subscriptionController.resumeSubscription);

module.exports = router;
