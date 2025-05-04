const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authenticateToken = require('../middlewares/authMiddleware');

// Routes for restaurant management
router.post('/add-partner', authenticateToken, restaurantController.addRestaurantPartner);
router.get('/', authenticateToken, restaurantController.getAllRestaurants);
router.get('/:id', authenticateToken, restaurantController.getRestaurantById);
router.put('/:id', authenticateToken, restaurantController.updateRestaurant);
router.delete('/:id', authenticateToken, restaurantController.deleteRestaurant);
// Create delivery partner
router.post('/delivery', restaurantController.createDeliveryPartner);

// Update delivery partner
router.put('/delivery/:id', restaurantController.updateDeliveryPartner);

// Delete delivery partner
router.delete('/delivery/:id', restaurantController.deleteDeliveryPartner);

// Get all delivery partners by restaurant ID
router.get('/delivery/restaurant/:restaurantId', restaurantController.getDeliveryPartnersByRestaurantId);

// Get delivery partner by ID
router.get('/delivery/:id', restaurantController.getDeliveryPartnerById);


module.exports = router;
