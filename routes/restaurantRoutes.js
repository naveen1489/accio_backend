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

module.exports = router;
