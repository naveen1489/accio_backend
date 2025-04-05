'use strict';

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authenticateToken = require('../middlewares/authMiddleware');

// Create a new menu
router.post('/', authenticateToken, menuController.createMenu);

// Update an existing menu
router.put('/:id', authenticateToken, menuController.updateMenu);

// Delete a menu
router.delete('/:id', authenticateToken, menuController.deleteMenu);

// Get all menus by restaurant
router.get('/restaurant/:restaurantId', authenticateToken, menuController.getMenusByRestaurant);

// Get all menus by status (veg or non-veg)
router.get('/status/:status', authenticateToken, menuController.getMenusByStatus);

// Get menu by ID
router.get('/:id', authenticateToken, menuController.getMenuById);

module.exports = router;