'use strict';

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authenticateToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: APIs for managing menus and menu reviews
 */

/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Create a new menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menuName:
 *                 type: string
 *               vegNonVeg:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *               price:
 *                 type: number
 *               menuCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     categoryName:
 *                       type: string
 *                     menuItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemName:
 *                             type: string
 *           example:
 *             menuName: "Veggie Pizza"
 *             vegNonVeg: "veg"
 *             restaurantId: "123e4567-e89b-12d3-a456-426614174000"
 *             price: 10.99
 *             menuCategories:
 *               - categoryName: "Lunch"
 *                 menuItems:
 *                   - itemName: "Cheese Pizza"
 *                   - itemName: "Veggie Pizza"
 *     responses:
 *       201:
 *         description: Menu created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, menuController.createMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Update an existing menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the menu to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menuName:
 *                 type: string
 *               vegNonVeg:
 *                 type: string
 *               price:
 *                 type: number
 *               menuCategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     categoryName:
 *                       type: string
 *                     menuItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemName:
 *                             type: string
 *           example:
 *             menuName: "Updated Veggie Pizza"
 *             vegNonVeg: "veg"
 *             price: 12.99
 *             menuCategories:
 *               - categoryName: "Dinner"
 *                 menuItems:
 *                   - itemName: "Paneer Pizza"
 *                   - itemName: "Mushroom Pizza"
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, menuController.updateMenu);

/**
 * @swagger
 * /api/menus/{id}:
 *   delete:
 *     summary: Delete a menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the menu to delete
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, menuController.deleteMenu);

/**
 * @swagger
 * /api/menus/restaurant/{restaurantId}:
 *   get:
 *     summary: Get all menus by restaurant
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the restaurant
 *     responses:
 *       200:
 *         description: Menus fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/restaurant/:restaurantId', authenticateToken, menuController.getMenusByRestaurant);

/**
 * @swagger
 * /api/menus/status/{status}:
 *   get:
 *     summary: Get all menus by status (veg or non-veg)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Status of the menu (veg or non-veg)
 *     responses:
 *       200:
 *         description: Menus fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/status/:status', authenticateToken, menuController.getMenusByStatus);

/**
 * @swagger
 * /api/menus/all:
 *   get:
 *     summary: Get all menus with pagination
 *     tags: [Menus]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Menus fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/all', menuController.getAllMenusWithPagination);

/**
 * @swagger
 * /api/menus/{id}:
 *   get:
 *     summary: Get menu by ID
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the menu
 *     responses:
 *       200:
 *         description: Menu fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, menuController.getMenuById);

/**
 * @swagger
 * /api/menus/menu/review:
 *   post:
 *     summary: Add or update menu review
 *     tags: [Menus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               menuId:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *               status:
 *                 type: string
 *               adminComment:
 *                 type: string
 *           example:
 *             menuId: "123e4567-e89b-12d3-a456-426614174000"
 *             restaurantId: "456e7890-e89b-12d3-a456-426614174001"
 *             status: "approved"
 *             adminComment: "Looks good"
 *     responses:
 *       200:
 *         description: Menu review updated successfully
 *       500:
 *         description: Internal server error
 */
router.post('/menu/review', menuController.addOrUpdateMenuReview);

module.exports = router;