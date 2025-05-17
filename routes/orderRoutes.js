const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

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
 *     summary: Get orders with filters
 *     tags: [Orders]
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
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', orderController.getOrders);

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
 * /api/orders/delivery-partner/{deliveryPartnerId}:
 *   get:
 *     summary: Get orders for a delivery partner
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: deliveryPartnerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the delivery partner
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       404:
 *         description: Delivery partner not found
 *       500:
 *         description: Internal server error
 */
router.get('/orders/delivery-partner/:deliveryPartnerId', orderController.getOrdersForDeliveryPartner);

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

module.exports = router;