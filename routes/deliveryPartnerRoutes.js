'use strict';

const express = require('express');
const router = express.Router();
const deliveryPartnerController = require('../controllers/deliveryPartnerController');
const authenticateToken = require('../middlewares/authMiddleware');

// Route for a restaurant partner to add a delivery partner
router.post('/add-partner', authenticateToken, deliveryPartnerController.addDeliveryPartner);

// Route for a restaurant partner to assign a delivery
router.post('/assign-delivery', authenticateToken, deliveryPartnerController.assignDelivery);

// Route for a delivery partner to view today’s deliveries
router.get('/today-deliveries', authenticateToken, deliveryPartnerController.getTodayDeliveries);

// Route for a delivery partner to mark a delivery as completed
router.post('/complete-delivery/:id', authenticateToken, deliveryPartnerController.completeDelivery);

// Route to get all delivery partners
router.get('/all-devlieryPartners', authenticateToken, deliveryPartnerController.getAllDeliveryPartners);

// Update delivery partner details
router.put('/update/:id', authenticateToken, deliveryPartnerController.updateDeliveryPartnerDetails);

module.exports = router;
