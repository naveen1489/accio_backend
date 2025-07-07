'use strict';

const { Op } = require('sequelize');
const models = require('../models'); 

/**
 * Add a new Delivery Partner.
 * This endpoint is used by the restaurant partner to add delivery employees.
 * Expected body fields: name, email, phone.
 * The restaurant partner's ID is obtained from req.user (e.g., req.user.restaurantId).
 */
exports.addDeliveryPartnerOld = async (req, res) => {
  try {
    const { name, email, phone, status, workingHoursStart, workingHoursEnd } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

// Extract userId from JWT token (assumes middleware sets req.user)
const userId = req.user.id;

// Fetch the restaurant associated with the userId
const restaurant = await models.Restaurant.findOne({ where: { userId } });
if (!restaurant) {
  return res.status(404).json({ message: 'Restaurant not found for the user' });
}

const restaurantId = restaurant.id;

    // Check if a delivery partner with the same email or phone already exists
    const existingPartner = await models.DeliveryPartner.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });
    if (existingPartner) {
      return res.status(400).json({ message: 'A delivery partner with the same email or phone already exists' });
    }

    // Create a new DeliveryPartner record
    const newPartner = await models.DeliveryPartner.create({
      name,
      email,
      phone,
      restaurantId,
      status: status || 'inactive', 
      workingHoursStart,
      workingHoursEnd,
    });

    res.status(200).json({ message: 'Delivery partner added successfully', deliveryPartner: newPartner });
  } catch (error) {
    console.error('Error adding delivery partner:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};


exports.addDeliveryPartner = async (req, res) => {
  try {
    const { name, email, phone, status, workingHoursStart, workingHoursEnd } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    // Extract userId from JWT token (assumes middleware sets req.user)
    const userId = req.user.id;

    // Fetch the restaurant associated with the userId
    const restaurant = await models.Restaurant.findOne({ where: { userId } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for the user' });
    }

    const restaurantId = restaurant.id;

    // Check if a delivery partner with the same email or phone already exists
    const existingPartner = await models.DeliveryPartner.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });
    if (existingPartner) {
      return res.status(400).json({ message: 'A delivery partner with the same email or phone already exists' });
    }

    // Create a new DeliveryPartner record
    const newPartner = await models.DeliveryPartner.create({
      name,
      email,
      phone,
      restaurantId,
      status: status || 'inactive',
      workingHoursStart,
      workingHoursEnd,
    });

    // Create a corresponding entry in the User table
    const newUser = await models.User.create({
      username: phone, // Use phone as the username
      password: await bcrypt.hash(phone, 10), // Default password is the phone number (hashed)
      role: 'delivery', // Set role as deliveryPartner
      status: 'active', // Default status
    });

    res.status(200).json({
      message: 'Delivery partner added successfully',
      deliveryPartner: newPartner,
      user: newUser,
    });
  } catch (error) {
    console.error('Error adding delivery partner:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Assign a Delivery to a Delivery Partner.
 * This endpoint allows a restaurant partner to assign a delivery task.
 * Expected body fields: deliveryPartnerId, subscriptionId, deliveryAddress, deliveryTime.
 */
exports.assignDelivery = async (req, res) => {
  try {
    // const { deliveryPartnerId, subscriptionId, deliveryAddress, deliveryTime } = req.body;
    // if (!deliveryPartnerId || !subscriptionId || !deliveryAddress || !deliveryTime) {
    //   return res.status(400).json({ message: 'Missing required fields' });
    // }
    const { deliveryPartnerId, subscriptionId } = req.body;
    if (!deliveryPartnerId || !subscriptionId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create a new Delivery record with initial status as 'Assigned'
    const delivery = await models.Delivery.create({ // <-- Use models.Delivery
      deliveryPartnerId,
      subscriptionId,
      deliveryAddress: '123 Main St, City, State, ZIP', // Example address
      deliveryTime :"2023-10-01T10:00:00Z", 
      status: 'Assigned',
    });

    res.status(200).json({ message: 'Delivery assigned successfully', delivery });
  } catch (error) {
    console.error('Error assigning delivery:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get Today’s Deliveries for the Logged-in Delivery Partner.
 * This endpoint is meant for the delivery partner to view the list of deliveries
 * assigned to them for the current day.
 */
exports.getTodayDeliveries = async (req, res) => {
  try {
    // Assume req.user.id is the delivery partner's ID (from JWT)
    const deliveryPartnerId = req.user.id;
    const now = new Date();

    // Calculate start and end of today
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const deliveries = await models.Delivery.findAll({ // <-- Use models.Delivery
      where: {
        deliveryPartnerId,
        deliveryTime: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [['deliveryTime', 'ASC']],
    });

    res.status(200).json({ deliveries });
  } catch (error) {
    console.error("Error fetching today's deliveries:", error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Mark a Delivery as Completed.
 * This endpoint allows the delivery partner to mark an assigned delivery as completed.
 * The delivery record is updated with a status of 'Completed' and the completion time.
 */
exports.completeDelivery = async (req, res) => {
  try {
    const { id } = req.params; // Delivery record ID
    const delivery = await models.Delivery.findByPk(id); // <-- Use models.Delivery
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Ensure the logged-in delivery partner is assigned to this delivery
    if (delivery.deliveryPartnerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to complete this delivery' });
    }

    // Update the delivery status and record completion time
    delivery.status = 'Completed';
    delivery.completedAt = new Date();
    await delivery.save();

    res.status(200).json({ message: 'Delivery marked as completed', delivery });
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get All Delivery Partners.
 * This endpoint fetches all delivery partners.
 */
exports.getAllDeliveryPartners = async (req, res) => {
  try {
    // Extract userId from JWT token (assumes middleware sets req.user)
    const userId = req.user.id;

    // Fetch the restaurant associated with the userId
    const restaurant = await models.Restaurant.findOne({ where: { userId } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for the user' });
    }

    const restaurantId = restaurant.id;

    // Fetch all delivery partners for the restaurant
    const deliveryPartners = await models.DeliveryPartner.findAll({
      where: { restaurantId },
    });

    res.status(200).json({ deliveryPartners });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Update Delivery Partner Details.
 * This endpoint allows updating name, phone, status, and working hours.
 * Expected body fields: name, phone, status, workingHoursStart, workingHoursEnd.
 */
exports.updateDeliveryPartnerDetails = async (req, res) => {
  try {
    const { id } = req.params; // Delivery Partner ID
    const { name, phone, status, workingHoursStart, workingHoursEnd } = req.body;

    // Find the delivery partner by ID
    const deliveryPartner = await models.DeliveryPartner.findByPk(id);
    if (!deliveryPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    // Update fields if provided
    deliveryPartner.name = name || deliveryPartner.name;
    deliveryPartner.phone = phone || deliveryPartner.phone;
    deliveryPartner.status = status || deliveryPartner.status;
    deliveryPartner.workingHoursStart = workingHoursStart || deliveryPartner.workingHoursStart;
    deliveryPartner.workingHoursEnd = workingHoursEnd || deliveryPartner.workingHoursEnd;

    // Save the updated delivery partner
    await deliveryPartner.save();

    res.status(200).json({ message: 'Delivery partner details updated successfully', deliveryPartner });
  } catch (error) {
    console.error('Error updating delivery partner details:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
