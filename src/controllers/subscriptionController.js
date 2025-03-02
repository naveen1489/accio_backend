'use strict';

const { Subscription } = require('../models/subscription');

/**
 * Create a new Subscription.
 * Expects JSON body with: restaurantId, mealPlanType, startDate, endDate.
 * The authenticated user's ID is used as the customer.
 */
exports.createSubscription = async (req, res) => {
  try {
    const { restaurantId, mealPlanType, startDate, endDate } = req.body;
    const userId = req.user.id; // Authenticated user

    if (!restaurantId || !mealPlanType || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const subscription = await Subscription.create({
      userId,
      restaurantId,
      mealPlanType,
      startDate,
      endDate,
      status: 'active'
    });

    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Update an existing Subscription.
 * Expects subscription ID in params and fields to update in the body.
 */
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { mealPlanType, startDate, endDate } = req.body;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    if (subscription.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this subscription' });
    }

    if (mealPlanType) subscription.mealPlanType = mealPlanType;
    if (startDate) subscription.startDate = startDate;
    if (endDate) subscription.endDate = endDate;

    await subscription.save();
    res.status(200).json({ message: 'Subscription updated successfully', subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Pause a Subscription.
 * Expects subscription ID in params.
 */
exports.pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    if (subscription.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to pause this subscription' });
    }

    subscription.status = 'paused';
    await subscription.save();
    res.status(200).json({ message: 'Subscription paused successfully', subscription });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Resume a Subscription.
 * Expects subscription ID in params.
 */
exports.resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    if (subscription.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to resume this subscription' });
    }

    subscription.status = 'active';
    await subscription.save();
    res.status(200).json({ message: 'Subscription resumed successfully', subscription });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Cancel a Subscription.
 * Expects subscription ID in params.
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    if (subscription.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this subscription' });
    }

    subscription.status = 'cancelled';
    await subscription.save();
    res.status(200).json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Get all Subscriptions for the authenticated user.
 */
exports.getSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptions = await Subscription.findAll({ where: { userId } });
    res.status(200).json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
