const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get orders with filters
router.get('/orders', orderController.getOrders);
// Assign order to delivery partner
router.patch('/orders/assign', orderController.assignOrderToDeliveryPartner);
// Get orders for a delivery partner
router.get('/orders/delivery-partner/:deliveryPartnerId', orderController.getOrdersForDeliveryPartner);

// Update order status by delivery partner
router.patch('/orders/:orderId/status', orderController.updateOrderStatusByDeliveryPartner);

module.exports = router;