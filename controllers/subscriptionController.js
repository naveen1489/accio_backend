'use strict';

const { Subscription } = require('../models/subscription');

exports.createSubscription = async (req, res) => {
  try {
    const {
      userId,
      restaurantId,
      menuId,
      categoryName,
      mealPlan,
      mealFrequency,
      startDate,
      endDate,
    } = req.body;

    // Check if the restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if the menu exists
    const menu = await Menu.findByPk(menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Create the subscription
    const subscription = await Subscription.create({
      userId,
      restaurantId,
      menuId,
      categoryName,
      mealPlan,
      mealFrequency,
      startDate,
      endDate,
      status: 'pending', // Default status
    });

    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      menuId,
      categoryName,
      mealPlan,
      mealFrequency,
      startDate,
      endDate,
      status,
    } = req.body;

    // Find the subscription by ID
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update fields if provided
    subscription.menuId = menuId || subscription.menuId;
    subscription.categoryName = categoryName || subscription.categoryName;
    subscription.mealPlan = mealPlan || subscription.mealPlan;
    subscription.mealFrequency = mealFrequency || subscription.mealFrequency;
    subscription.startDate = startDate || subscription.startDate;
    subscription.endDate = endDate || subscription.endDate;
    subscription.status = status || subscription.status;

    // Save the updated subscription
    await subscription.save();

    res.status(200).json({ message: 'Subscription updated successfully', subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
exports.getSubscriptionsByMenuId = async (req, res) => {
  try {
    const { menuId } = req.params;

    // Find subscriptions by menuId
    const subscriptions = await Subscription.findAll({
      where: { menuId },
      include: [
        { model: User, as: 'customer' },
        { model: Restaurant, as: 'restaurant' },
        { model: Menu, as: 'menu' },
      ],
    });

    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions by menuId:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
exports.getSubscriptionsByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Find subscriptions by restaurantId
    const subscriptions = await Subscription.findAll({
      where: { restaurantId },
      include: [
        { model: User, as: 'customer' },
        { model: Restaurant, as: 'restaurant' },
        { model: Menu, as: 'menu' },
      ],
    });

    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions by restaurantId:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
exports.getSubscriptionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find subscriptions by userId
    const subscriptions = await Subscription.findAll({
      where: { userId },
      include: [
        { model: User, as: 'customer' },
        { model: Restaurant, as: 'restaurant' },
        { model: Menu, as: 'menu' },
      ],
    });

    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions by userId:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find subscription by ID
    const subscription = await Subscription.findByPk(id, {
      include: [
        { model: User, as: 'customer' },
        { model: Restaurant, as: 'restaurant' },
        { model: Menu, as: 'menu' },
      ],
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription by id:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};


exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params; // Subscription ID
    const { status } = req.body; // New status

    // Validate the status
    const validStatuses = ['pending', 'rejected', 'approved', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` });
    }

    // Find the subscription by ID
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update the status
    subscription.status = status;
    await subscription.save();

    res.status(200).json({ message: 'Subscription status updated successfully', subscription });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};