'use strict';

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin category management APIs
 */

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Add a new category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category
 *               description:
 *                 type: string
 *                 description: Description of the category
 *           example:
 *             name: "Pizza"
 *             description: "All types of pizzas"
 *     responses:
 *       201:
 *         description: Category added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/categories', authenticateToken, adminController.addCategory);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Pizza"
 *                 description: "All types of pizzas"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/categories', authenticateToken, adminController.getAllCategories);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the category
 *               description:
 *                 type: string
 *                 description: Updated description of the category
 *           example:
 *             name: "Updated Pizza"
 *             description: "Updated description for pizzas"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put('/categories/:id', authenticateToken, adminController.updateCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category to delete
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete('/categories/:id', authenticateToken, adminController.deleteCategory);

module.exports = router;