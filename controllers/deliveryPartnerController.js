'use strict';

const { Op } = require('sequelize');
const DeliveryPartner  = require('../models/deliveryPartner');
const Delivery  = require('../models/delivery');


/**
 * Add a new Delivery Partner.
 * This endpoint is used by the restaurant partner to add delivery employees.
 * Expected body fields: name, email, phone.
 * The restaurant partner's ID is obtained from req.user (e.g., req.user.restaurantId).
 */
exports.addDeliveryPartner = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    // Assume the logged-in user (restaurant partner) has a restaurantId
    const restaurantId = req.user.restaurantId || req.user.id;

    // Create a new DeliveryPartner record
    const newPartner = await DeliveryPartner.create({
      name,
      email,
      phone,
      restaurantId,
    });

    res.status(201).json({ message: 'Delivery partner added successfully', deliveryPartner: newPartner });
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
    const { deliveryPartnerId, subscriptionId, deliveryAddress, deliveryTime } = req.body;
    if (!deliveryPartnerId || !subscriptionId || !deliveryAddress || !deliveryTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create a new Delivery record with initial status as 'Assigned'
    const delivery = await Delivery.create({
      deliveryPartnerId,
      subscriptionId,
      deliveryAddress,
      deliveryTime,
      status: 'Assigned',
    });

    res.status(201).json({ message: 'Delivery assigned successfully', delivery });
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

    const deliveries = await Delivery.findAll({
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
    const delivery = await Delivery.findByPk(id);
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
