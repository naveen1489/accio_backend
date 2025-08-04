const { Op } = require('sequelize');
const { Order, Menu, Subscription, DeliveryPartner, Restaurant, Consumer, Address, Complaint, MenuItem, MenuCategory } = require('../models');


// Get orders with filters
exports.getOrders = async (req, res) => {
  try {
    // Extract userId from JWT token (assumes middleware sets req.user)
    const userId = req.user.id;

    // Fetch the restaurant associated with the userId
    const restaurant = await Restaurant.findOne({ where: { userId } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for the user' });
    }

    const restaurantId = restaurant.id;

    // Extract filters from query parameters
    const { categoryName, startDate, endDate, status, orderId, page = 1, limit = 10 } = req.query;

    // Build the filter conditions
    const filters = { restaurantId }; // Filter by restaurantId

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

    // Pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Build include for Subscription with categoryName filter
    const subscriptionInclude = {
      model: Subscription,
      as: 'subscription',
      attributes: ['id', 'mealPlan', 'mealFrequency', 'categoryName'], // Include subscription details
    };
    if (categoryName) {
      subscriptionInclude.where = { categoryName };
      subscriptionInclude.required = true; // Ensure it's an INNER JOIN if filtering
    }

    // Query the orders with filters and include related details
    const { count, rows: orders } = await Order.findAndCountAll({
      where: filters,
      limit: parseInt(limit, 10),
      offset,
      order: [['orderDate', 'DESC']],
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName', 'price'], // Include menu details
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
          as: 'address', // Include address details
        },
        subscriptionInclude,
      ],
      distinct: true, // Necessary for correct counts with includes
    });

    res.status(200).json({
      message: 'Orders fetched successfully',
      totalOrders: count,
      totalPages: Math.ceil(count / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      orders,
    });
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
    const userId = req.user.id;

    // Find the delivery partner by userId
    const deliveryPartner = await DeliveryPartner.findOne({ where: { userId } });
    if (!deliveryPartner) {
      return res.status(404).json({ message: 'Delivery partner not found for the user' });
    }
    const deliveryPartnerId = deliveryPartner.id;
     
    // Extract pagination parameters
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Query the orders with filters and include related details
    const { count, rows: orders } = await Order.findAndCountAll({
      where: { deliveryPartnerId },
      limit: parseInt(limit, 10),
      offset,
      order: [['orderDate', 'DESC']],
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName', 'price'], // Include menu details
          include: [
            {
              model: MenuCategory,
              as: 'menuCategories',
              attributes: ['id', 'categoryName'], // Include menu category
            },
          ],
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
          attributes: ['id', 'name', 'companyName'], // Include restaurant details
        },
        {
          model: Consumer,
          as: 'consumer',
          attributes: ['id', 'name','mobile'], // Include consumer name
        },
        {
          model: Address,
          as: 'address', // Include address details
        },
      ],
    });

    res.status(200).json({
      message: 'Orders fetched successfully',
      totalOrders: count,
      totalPages: Math.ceil(count / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      orders,
    });
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

  exports.getOrderAndRevenueStatsOld = async (req, res) => {
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
    startOfWeek.setDate(today.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate the start of the month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

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

    // Fetch total completed orders for the month
    const totalOrdersMonth = await Order.count({
      where: {
        status: 'completed',
        restaurantId,
        orderDate: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // Fetch total completed orders for all time
    const totalOrdersAll = await Order.count({
      where: {
        status: 'completed',
        restaurantId,
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

    // Fetch total revenue for the month
    const totalRevenueMonth = await Subscription.sum('paymentAmount', {
      where: {
        paymentStatus: 'paid',
        restaurantId,
        updatedAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    // Fetch total revenue for all time
    const totalRevenueAll = await Subscription.sum('paymentAmount', {
      where: {
        paymentStatus: 'paid',
        restaurantId,
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
        totalOrdersMonth,
        totalOrdersAll,
        totalRevenueToday: totalRevenueToday || 0,
        totalRevenueWeek: totalRevenueWeek || 0,
        totalRevenueMonth: totalRevenueMonth || 0,
        totalRevenueAll: totalRevenueAll || 0,
        totalPendingPayments: totalPendingPayments || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching order and revenue stats:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

 exports.createComplaint = async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from JWT
    const { orderId, subscriptionId, menuId, restaurantId, complaintMessage, imageUrls } = req.body;

    // Validate required fields
    if (!orderId || !subscriptionId || !menuId || !restaurantId || !complaintMessage) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Fetch consumerId using userId
    const consumer = await Consumer.findOne({ where: { userId } });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found for the given user' });
    }
    const consumerId = consumer.id;

    // Create the complaint
    const complaint = await Complaint.create({
      orderId,
      subscriptionId,
      menuId,
      restaurantId,
      consumerId,
      complaintMessage,
      imageUrls, // Add image URLs
      status: 'pending', // Default status
    });

    res.status(201).json({ message: 'Complaint created successfully', complaint });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from JWT
    const { complaintId } = req.params; // Complaint ID from URL
    const { comment } = req.body; // Comment from request body

    // Validate required fields
    if (!comment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    // Fetch the restaurant associated with the userId
    const restaurant = await Restaurant.findOne({ where: { userId } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for the user' });
    }

    const restaurantId = restaurant.id;

    // Find the complaint by ID and ensure it belongs to the restaurant
    const complaint = await Complaint.findOne({ where: { id: complaintId, restaurantId } });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or does not belong to the restaurant' });
    }

    // Update the complaint status and add the comment
    complaint.status = 'resolved';
    complaint.comment = comment;
    await complaint.save();

    res.status(200).json({ message: 'Complaint status updated successfully', complaint });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getComplaintsByRestaurant = async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from JWT

    // Fetch the restaurant associated with the userId
    const restaurant = await Restaurant.findOne({ where: { userId } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for the user' });
    }

    const restaurantId = restaurant.id;

    // Extract pagination parameters
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Fetch complaints for the restaurant
    const complaints = await Complaint.findAndCountAll({
      where: { restaurantId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber'], // Include consumer name
        },
        {
          model: Consumer,
          as: 'consumer',
          attributes: ['id', 'name', 'mobile'], // Include consumer name
        },
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName'], // Include menu name
          include: [
            {
              model: MenuCategory,
              as: 'menuCategories',
              attributes: ['id', 'categoryName'], // Include menu category
              include: [
                {
                  model: MenuItem,
                  as: 'menuItems',
                  attributes: ['id', 'itemName', 'itemCategory'], // Include menu items
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      message: 'Complaints fetched successfully',
      totalComplaints: complaints.count,
      totalPages: Math.ceil(complaints.count / limit),
      currentPage: parseInt(page),
      complaints: complaints.rows,
    });
  } catch (error) {
    console.error('Error fetching complaints by restaurant:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getComplaintsByConsumer = async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from JWT

    // Fetch the consumer associated with the userId
    const consumer = await Consumer.findOne({ where: { userId } });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found for the user' });
    }

    const consumerId = consumer.id;

    // Extract pagination parameters
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Fetch complaints for the consumer
    const complaints = await Complaint.findAndCountAll({
      where: { consumerId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
         {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNumber'], // Include consumer name
        },
        {
          model: Consumer,
          as: 'consumer',
          attributes: ['id', 'name'], // Include consumer name
        },
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName'], // Include menu name
          include: [
             {
              model: MenuCategory,
              as: 'menuCategories',
              attributes: ['id', 'categoryName'], // Include menu category
              include: [
                {
                  model: MenuItem,
                  as: 'menuItems',
                  attributes: ['id', 'itemName', 'itemCategory'], // Include menu items
                },
              ],
            },
          ],
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name'], // Include restaurant name
        },
      ],
    });

    res.status(200).json({
      message: 'Complaints fetched successfully',
      totalComplaints: complaints.count,
      totalPages: Math.ceil(complaints.count / limit),
      currentPage: parseInt(page),
      complaints: complaints.rows,
    });
  } catch (error) {
    console.error('Error fetching complaints by consumer:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};