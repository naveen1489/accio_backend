const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authenticateToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: APIs for managing restaurants and their delivery partners
 */

/**
 * @swagger
 * /api/restaurants/add-partner:
 *   post:
 *     summary: Add a new restaurant partner
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               nameTitle:
 *                 type: string
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               emailId:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *           example:
 *             companyName: "Pizza Palace"
 *             nameTitle: "Mr."
 *             name: "John Doe"
 *             contactNumber: "9876543210"
 *             emailId: "john@example.com"
 *             addressLine1: "123 Main Street"
 *             city: "New York"
 *             state: "NY"
 *             postalCode: "10001"
 *             country: "USA"
 *     responses:
 *       201:
 *         description: Restaurant partner added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/add-partner', authenticateToken, restaurantController.addRestaurantPartner);

router.get('/profile', authenticateToken, restaurantController.getRestaurantProfile);

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Restaurants fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, restaurantController.getAllRestaurants);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get a restaurant by ID
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the restaurant
 *     responses:
 *       200:
 *         description: Restaurant fetched successfully
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, restaurantController.getRestaurantById);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the restaurant to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               emailId:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *           example:
 *             companyName: "Updated Pizza Palace"
 *             name: "Jane Doe"
 *             contactNumber: "9876543211"
 *             emailId: "jane@example.com"
 *             addressLine1: "456 Elm Street"
 *             city: "San Francisco"
 *             state: "CA"
 *             postalCode: "94103"
 *             country: "USA"
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, restaurantController.updateRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the restaurant to delete
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, restaurantController.deleteRestaurant);

/**
 * @swagger
 * /api/restaurants/delivery:
 *   post:
 *     summary: Create a delivery partner for a restaurant
 *     tags: [Restaurants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *               workingHoursStart:
 *                 type: string
 *               workingHoursEnd:
 *                 type: string
 *               restaurantId:
 *                 type: string
 *           example:
 *             name: "Delivery Partner A"
 *             phone: "9876543210"
 *             email: "delivery@example.com"
 *             status: "active"
 *             workingHoursStart: "09:00"
 *             workingHoursEnd: "18:00"
 *             restaurantId: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Delivery partner created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/delivery', restaurantController.createDeliveryPartner);

/**
 * @swagger
 * /api/restaurants/delivery/{id}:
 *   put:
 *     summary: Update a delivery partner
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the delivery partner to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *               workingHoursStart:
 *                 type: string
 *               workingHoursEnd:
 *                 type: string
 *           example:
 *             name: "Updated Delivery Partner"
 *             phone: "9876543211"
 *             email: "updated@example.com"
 *             status: "inactive"
 *             workingHoursStart: "10:00"
 *             workingHoursEnd: "19:00"
 *     responses:
 *       200:
 *         description: Delivery partner updated successfully
 *       404:
 *         description: Delivery partner not found
 *       500:
 *         description: Internal server error
 */
router.put('/delivery/:id', restaurantController.updateDeliveryPartner);

/**
 * @swagger
 * /api/restaurants/delivery/{id}:
 *   delete:
 *     summary: Delete a delivery partner
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the delivery partner to delete
 *     responses:
 *       200:
 *         description: Delivery partner deleted successfully
 *       404:
 *         description: Delivery partner not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delivery/:id', restaurantController.deleteDeliveryPartner);

/**
 * @swagger
 * /api/restaurants/delivery/restaurant/{restaurantId}:
 *   get:
 *     summary: Get all delivery partners by restaurant ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the restaurant
 *     responses:
 *       200:
 *         description: Delivery partners fetched successfully
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
router.get('/delivery/restaurant/:restaurantId', restaurantController.getDeliveryPartnersByRestaurantId);



module.exports = router;