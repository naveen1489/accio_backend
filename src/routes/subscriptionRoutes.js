'use strict';

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authenticateToken = require('../middlewares/authMiddleware');

// Create a new subscription
router.post('/create', authenticateToken, subscriptionController.createSubscription);

// Update an existing subscription
router.put('/update/:id', authenticateToken, subscriptionController.updateSubscription);

// Pause a subscription
router.post('/pause/:id', authenticateToken, subscriptionController.pauseSubscription);

// Resume a subscription
router.post('/resume/:id', authenticateToken, subscriptionController.resumeSubscription);

// Cancel a subscription
router.post('/cancel/:id', authenticateToken, subscriptionController.cancelSubscription);

// Get all subscriptions for the authenticated user
router.get('/', authenticateToken, subscriptionController.getSubscriptions);

module.exports = router;
