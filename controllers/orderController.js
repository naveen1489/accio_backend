const { Op } = require('sequelize');
const { Order, Menu, Subscription, DeliveryPartner, Restaurant, Consumer, Address } = require('../models');


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
        {
          model: Address,
          as: 'address'        },
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

  exports.getOrderAndRevenueStats = async (req, res) => {
    try {
      const userId = req.user.id; // Extract userId from JWT token
  
      // Fetch the restaurantId for the user
      const restaurant = await Restaurant.findOne({ where: { userId } });
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found for the user' });
      }
  
      const restaurantId = restaurant.id;
  
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
  
      // Calculate the start of the week (Monday)
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Sunday
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - daysSinceMonday); // Go back to Monday
      startOfWeek.setHours(0, 0, 0, 0); // Start of the week
  
      // Fetch total completed orders for today
      const totalOrdersToday = await Order.count({
        where: {
          status: 'completed',
          restaurantId,
          orderDate: {
            [Op.gte]: today,
          },
        },
      });
  
      // Fetch total completed orders for the week so far
      const totalOrdersWeek = await Order.count({
        where: {
          status: 'completed',
          restaurantId,
          orderDate: {
            [Op.between]: [startOfWeek, today],
          },
        },
      });
  
      // Fetch total revenue for today
      const totalRevenueToday = await Subscription.sum('paymentAmount', {
        where: {
          paymentStatus: 'paid',
          restaurantId,
          updatedAt: {
            [Op.gte]: today,
          },
        },
      });
  
      // Fetch total revenue for the week so far
      const totalRevenueWeek = await Subscription.sum('paymentAmount', {
        where: {
          paymentStatus: 'paid',
          restaurantId,
          updatedAt: {
            [Op.between]: [startOfWeek, today],
          },
        },
      });
  
      // Fetch total pending payments for approved subscriptions
      const totalPendingPayments = await Subscription.sum('paymentAmount', {
        where: {
          paymentStatus: 'pending',
          status: 'approved',
          restaurantId,
        },
      });
  
      res.status(200).json({
        message: 'Order and revenue stats fetched successfully',
        stats: {
          totalOrdersToday,
          totalOrdersWeek,
          totalRevenueToday: totalRevenueToday || 0,
          totalRevenueWeek: totalRevenueWeek || 0,
          totalPendingPayments: totalPendingPayments || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching order and revenue stats:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };