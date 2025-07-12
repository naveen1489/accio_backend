'use strict';

const express = require('express');
const router = express.Router();
const deliveryPartnerController = require('../controllers/deliveryPartnerController');
const authenticateToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Delivery Partners
 *   description: APIs for managing delivery partners and their deliveries
 */

/**
 * @swagger
 * /api/delivery-partners/add-partner:
 *   post:
 *     summary: Add a new delivery partner
 *     tags: [Delivery Partners]
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
 *                 description: Name of the delivery partner
 *               email:
 *                 type: string
 *                 description: Email of the delivery partner
 *               phone:
 *                 type: string
 *                 description: Phone number of the delivery partner
 *               restaurantId:
 *                 type: string
 *                 description: ID of the restaurant
 *               status:
 *                 type: string
 *                 description: Status of the delivery partner
 *               workingHoursStart:
 *                 type: string
 *                 description: Start of working hours
 *               workingHoursEnd:
 *                 type: string
 *                 description: End of working hours
 *           example:
 *             name: "John Doe"
 *             email: "john@example.com"
 *             phone: "9876543210"
 *             restaurantId: "123e4567-e89b-12d3-a456-426614174000"
 *             status: "active"
 *             workingHoursStart: "09:00"
 *             workingHoursEnd: "18:00"
 *     responses:
 *       201:
 *         description: Delivery partner added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/add-partner', authenticateToken, deliveryPartnerController.addDeliveryPartner);

/**
 * @swagger
 * /api/delivery-partners/assign-delivery:
 *   post:
 *     summary: Assign a delivery to a delivery partner
 *     tags: [Delivery Partners]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryPartnerId:
 *                 type: string
 *                 description: ID of the delivery partner
 *               subscriptionId:
 *                 type: string
 *                 description: ID of the subscription
 *               deliveryAddress:
 *                 type: string
 *                 description: Address for the delivery
 *               deliveryTime:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled delivery time
 *           example:
 *             deliveryPartnerId: "456e7890-e89b-12d3-a456-426614174001"
 *             subscriptionId: "789e1234-e89b-12d3-a456-426614174002"
 *             deliveryAddress: "123 Main Street, New York, NY"
 *             deliveryTime: "2025-05-12T10:00:00Z"
 *     responses:
 *       200:
 *         description: Delivery assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Delivery partner or subscription not found
 *       500:
 *         description: Internal server error
 */
router.post('/assign-delivery', authenticateToken, deliveryPartnerController.assignDelivery);

/**
 * @swagger
 * /api/delivery-partners/today-deliveries:
 *   get:
 *     summary: Get today’s deliveries for the logged-in delivery partner
 *     tags: [Delivery Partners]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Deliveries fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/today-deliveries', authenticateToken, deliveryPartnerController.getTodayDeliveries);

/**
 * @swagger
 * /api/delivery-partners/complete-delivery/{id}:
 *   post:
 *     summary: Mark a delivery as completed
 *     tags: [Delivery Partners]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the delivery to mark as completed
 *     responses:
 *       200:
 *         description: Delivery marked as completed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Delivery not found
 *       500:
 *         description: Internal server error
 */
router.post('/complete-delivery/:id', authenticateToken, deliveryPartnerController.completeDelivery);

/**
 * @swagger
 * /api/delivery-partners/all-delivery-partners:
 *   get:
 *     summary: Get all delivery partners
 *     tags: [Delivery Partners]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
 *     responses:
 *       200:
 *         description: Delivery partners fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/all-delivery-partners', authenticateToken, deliveryPartnerController.getAllDeliveryPartners);

/**
 * @swagger
 * /api/delivery-partners/update/{id}:
 *   put:
 *     summary: Update delivery partner details
 *     tags: [Delivery Partners]
 *     security:
 *       - bearerAuth: [] # Requires Authorization header
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
 *                 description: Updated name of the delivery partner
 *               phone:
 *                 type: string
 *                 description: Updated phone number of the delivery partner
 *               status:
 *                 type: string
 *                 description: Updated status of the delivery partner
 *               workingHoursStart:
 *                 type: string
 *                 description: Updated start of working hours
 *               workingHoursEnd:
 *                 type: string
 *                 description: Updated end of working hours
 *           example:
 *             name: "Jane Doe"
 *             phone: "9876543211"
 *             status: "inactive"
 *             workingHoursStart: "10:00"
 *             workingHoursEnd: "19:00"
 *     responses:
 *       200:
 *         description: Delivery partner updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Delivery partner not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:id', authenticateToken, deliveryPartnerController.updateDeliveryPartnerDetails);


/**
 * @swagger
 * /delivery-partner/profile:
 *   get:
 *     summary: Get profile of the logged-in delivery partner
 *     tags:
 *       - DeliveryPartner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery partner profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     status:
 *                       type: string
 *                     workingHoursStart:
 *                       type: string
 *                     workingHoursEnd:
 *                       type: string
 *                     restaurant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         companyName:
 *                           type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         username:
 *                           type: string
 *                         role:
 *                           type: string
 *                         status:
 *                           type: string
 *       404:
 *         description: Delivery partner profile not found
 *       500:
 *         description: Internal server error
 */

// Route definition
router.get('/profile', authMiddleware, deliveryPartnerController.getProfile);
module.exports = router;