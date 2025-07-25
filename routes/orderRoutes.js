const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware  = require('../middlewares/authMiddleware');
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: APIs for managing orders
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders with filters and pagination
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryName
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Filter by order ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalOrders:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get('/',authMiddleware, orderController.getOrders);

/**
 * @swagger
 * /api/orders/assign:
 *   patch:
 *     summary: Assign an order to a delivery partner
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order to assign
 *               deliveryPartnerId:
 *                 type: string
 *                 description: ID of the delivery partner
 *           example:
 *             orderId: "123e4567-e89b-12d3-a456-426614174000"
 *             deliveryPartnerId: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Order assigned to delivery partner successfully
 *       404:
 *         description: Order or delivery partner not found
 *       500:
 *         description: Internal server error
 */
router.patch('/assign', orderController.assignOrderToDeliveryPartner);

/**
 * @swagger
 * /api/orders/delivery-partner:
 *   get:
 *     summary: Get orders for a delivery partner with pagination
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalOrders:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Delivery partner not found
 *       500:
 *         description: Internal server error
 */
router.get('/delivery-partner',authMiddleware,  orderController.getOrdersForDeliveryPartner);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status by delivery partner
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the order
 *           example:
 *             status: "completed"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:orderId/status', orderController.updateOrderStatusByDeliveryPartner);




router.get('/stats', authMiddleware, orderController.getOrderAndRevenueStats);


/**
 * @swagger
 * /api/orders/complaint:
 *   post:
 *     summary: Create a complaint for an order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: ID of the order
 *               subscriptionId:
 *                 type: integer
 *                 description: ID of the subscription
 *               menuId:
 *                 type: integer
 *                 description: ID of the menu
 *               restaurantId:
 *                 type: integer
 *                 description: ID of the restaurant
 *               complaintMessage:
 *                 type: string
 *                 description: Complaint message
 *               imageUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs related to the complaint
 *           example:
 *             orderId: 1
 *             subscriptionId: 2
 *             menuId: 3
 *             restaurantId: 4
 *             complaintMessage: "The food was cold and late."
 *             imageUrls: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/complaint', authMiddleware, orderController.createComplaint);

/**
 * @swagger
 * /api/orders/complaint/{complaintId}/resolve:
 *   patch:
 *     summary: Update complaint status to resolved and add a comment for the consumer
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the complaint to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Comment for the consumer
 *           example:
 *             comment: "We apologize for the inconvenience. The issue has been resolved."
 *     responses:
 *       200:
 *         description: Complaint status updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Internal server error
 */
router.patch('/complaint/:complaintId/resolve', authMiddleware, orderController.updateComplaintStatus);

/**
 * @swagger
 * /api/orders/complaints/restaurant:
 *   get:
 *     summary: Get complaints for the restaurant
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of complaints per page
 *     responses:
 *       200:
 *         description: Complaints fetched successfully
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
router.get('/complaints/restaurant', authMiddleware, orderController.getComplaintsByRestaurant);

/**
 * @swagger
 * /api/orders/complaints/consumer:
 *   get:
 *     summary: Get complaints for the consumer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of complaints per page
 *     responses:
 *       200:
 *         description: Complaints fetched successfully
 *       404:
 *         description: Consumer not found
 *       500:
 *         description: Internal server error
 */
router.get('/complaints/consumer', authMiddleware, orderController.getComplaintsByConsumer);
module.exports = router;