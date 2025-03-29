'use strict';

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authMiddleware');

// Routes for category management
router.post('/categories', authenticateToken, adminController.addCategory); // Add a new category
router.get('/categories', authenticateToken, adminController.getAllCategories); // Get all categories
router.put('/categories/:id', authenticateToken, adminController.updateCategory); // Update a category
router.delete('/categories/:id', authenticateToken, adminController.deleteCategory); // Delete a category

module.exports = router;