const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');

// Create consumer
router.post('/consumer/create', consumerController.createConsumer);

// Login consumer
router.post('/consumer/login', consumerController.loginConsumer);

// Update consumer
router.put('/consumer/update/:id', consumerController.updateConsumer);

// Delete consumer
router.delete('/consumer/delete/:id', consumerController.deleteConsumer);

// Get consumer by ID
router.get('/consumer/:id', consumerController.getConsumerById);

// Get all consumers
router.get('/consumer', consumerController.getAllConsumers);


// Create address
router.post('/address/create', consumerController.createAddress);

// Get addresses by consumer ID
router.get('/address/consumer/:consumerId', consumerController.getAddressesByConsumerId);

// Update address
router.put('/address/update/:id', consumerController.updateAddress);

// Delete address
router.delete('/address/delete/:id', consumerController.deleteAddress);

module.exports = router;