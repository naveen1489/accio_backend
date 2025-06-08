const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');
const authenticateToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Consumers
 *   description: Consumer management and address-related APIs
 */

/**
 * @swagger
 * /api/consumers/create:
 *   post:
 *     summary: Create a new consumer
 *     tags: [Consumers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *           example:
 *             name: "John Doe"
 *             email: "johndoe@example.com"
 *             mobile: "9876543210"
 *             password: "securepassword"
 *             confirmPassword: "securepassword"
 *     responses:
 *       201:
 *         description: Consumer created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/create', consumerController.createConsumer);

/**
 * @swagger
 * /api/consumers/login:
 *   post:
 *     summary: Login a consumer
 *     tags: [Consumers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             mobile: "9876543210"
 *             password: "securepassword"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/login', consumerController.loginConsumer);

/**
 * @swagger
 * /api/consumers/update:
 *   put:
 *     summary: Update a consumer
 *     tags: [Consumers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the consumer to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *           example:
 *             name: "John Doe"
 *             email: "johndoe@example.com"
 *             mobile: "9876543210"
 *     responses:
 *       200:
 *         description: Consumer updated successfully
 *       404:
 *         description: Consumer not found
 *       500:
 *         description: Internal server error
 */
router.put('/update', authenticateToken, consumerController.updateConsumer);

/**
 * @swagger
 * /api/consumers/delete/{id}:
 *   delete:
 *     summary: Delete a consumer
 *     tags: [Consumers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the consumer to delete
 *     responses:
 *       200:
 *         description: Consumer deleted successfully
 *       404:
 *         description: Consumer not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', consumerController.deleteConsumer);

/**
 * @swagger
 * /api/consumers/{id}:
 *   get:
 *     summary: Get a consumer by ID
 *     tags: [Consumers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the consumer to fetch
 *     responses:
 *       200:
 *         description: Consumer fetched successfully
 *       404:
 *         description: Consumer not found
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, consumerController.getConsumerById);


/**
 * @swagger
 * /api/consumers/address/create:
 *   post:
 *     summary: Create an address for a consumer
 *     tags: [Consumers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consumerId:
 *                 type: string
 *               addressTag:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               mobile:
 *                 type: string
 *           example:
 *             consumerId: "123e4567-e89b-12d3-a456-426614174000"
 *             addressTag: "Home"
 *             addressLine1: "123 Main Street"
 *             addressLine2: "Apt 4B"
 *             city: "New York"
 *             state: "NY"
 *             pincode: "10001"
 *             mobile: "9876543210"
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/address/create', authenticateToken, consumerController.createAddress);

/**
 * @swagger
 * /api/consumers/address/update-current:
 *   patch:
 *     summary: Update the current address for a consumer
 *     tags: [Consumers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consumerId:
 *                 type: string
 *               addressId:
 *                 type: string
 *           example:
 *             consumerId: "123e4567-e89b-12d3-a456-426614174000"
 *             addressId: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Current address updated successfully
 *       404:
 *         description: Consumer or address not found
 *       500:
 *         description: Internal server error
 */
router.patch('/address/update-current',authenticateToken, consumerController.updateCurrentAddress);


/**
 * @swagger
 * /api/consumers/addresses/get:
 *   get:
 *     summary: Get all addresses for the authenticated consumer
 *     tags: [Consumers]
 *     security:
 *       - bearerAuth: []  # Indicate that this route requires a Bearer token
 *     responses:
 *       200:
 *         description: Addresses fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       consumerId:
 *                         type: string
 *                       addressTag:
 *                         type: string
 *                       addressLine1:
 *                         type: string
 *                       addressLine2:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       pincode:
 *                         type: string
 *                       mobile:
 *                         type: string
 *                       latitude:
 *                         type: string
 *                       longitude:
 *                         type: string
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: No addresses found for this consumer
 *       500:
 *         description: Internal server error
 */
router.get('/addresses/get', authenticateToken, consumerController.getAddressesByConsumerId);
router.patch('/address/update/:id', authenticateToken, consumerController.updateAddress);
router.delete('/address/delete/:id', authenticateToken, consumerController.deleteAddress);

module.exports = router;