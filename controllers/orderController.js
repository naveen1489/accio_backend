const { Op } = require('sequelize');
const { Order, Menu, Subscription, DeliveryPartner, Restaurant, Consumer } = require('../models');


// Get orders with filters
exports.getOrders = async (req, res) => {
  try {
    const { categoryName, startDate, endDate, status, orderId } = req.query;

    // Build the filter conditions
    const filters = {};

    if (orderId) {
      filters.id = orderId; // Filter by order ID
    }

    if (status) {
      filters.status = status; // Filter by status
    }

    if (startDate && endDate) {
      filters.orderDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)], // Filter by date range
      };
    } else if (startDate) {
      filters.orderDate = {
        [Op.gte]: new Date(startDate), // Filter by start date
      };
    } else if (endDate) {
      filters.orderDate = {
        [Op.lte]: new Date(endDate), // Filter by end date
      };
    }

    // Query the orders with filters and include related details
    const orders = await Order.findAll({
      where: filters,
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName', 'price'], // Include menu details
          where: categoryName ? { categoryName } : {}, // Filter by category if provided
        },
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'mealPlan', 'mealFrequency'], // Include subscription details
        },
        {
          model: DeliveryPartner,
          as: 'deliveryPartner',
          attributes: ['id', 'name'], // Include delivery partner name
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name'], // Include restaurant details
        },
        {
          model: Consumer,
          as: 'consumer',
          attributes: ['id', 'name'], // Include consumer name
        },
      ],
    });

    res.status(200).json({ message: 'Orders fetched successfully', orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.assignOrderToDeliveryPartner = async (req, res) => {
  try {
    const { orderId, deliveryPartnerId } = req.body;

    // Find the order by ID
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the delivery partner by ID
    const deliveryPartner = await DeliveryPartner.findByPk(deliveryPartnerId);
    if (!deliveryPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    // Check if the delivery partner belongs to the same restaurant as the order
    if (order.restaurantId !== deliveryPartner.restaurantId) {
      return res.status(400).json({ message: 'Delivery partner does not belong to the same restaurant' });
    }

    // Assign the delivery partner to the order
    order.deliveryPartnerId = deliveryPartnerId;
    order.status = 'assigned'; // Update the order status to "assigned"
    await order.save();

    res.status(200).json({ message: 'Order assigned to delivery partner successfully', order });
  } catch (error) {
    console.error('Error assigning order to delivery partner:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getOrdersForDeliveryPartner = async (req, res) => {
    try {
      const { deliveryPartnerId } = req.params;
  
      // Find all orders assigned to the delivery partner
      const orders = await Order.findAll({
        where: { deliveryPartnerId },
        include: [
          {
            model: Menu,
            as: 'menu',
            attributes: ['id', 'name', 'price', 'description', 'categoryName'], // Include menu details
          },
          {
            model: Restaurant,
            as: 'restaurant',
            attributes: ['id', 'name', 'addressLine1', 'city', 'state', 'postalCode'], // Include restaurant details
          },
        ],
      });
  
      res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (error) {
      console.error('Error fetching orders for delivery partner:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };

  exports.updateOrderStatusByDeliveryPartner = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
  
      // Validate the status
      const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` });
      }
  
      // Find the order by ID
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Update the order status
      order.status = status;
      await order.save();
  
      res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };