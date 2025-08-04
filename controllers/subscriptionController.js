'use strict';

const { Subscription, Order, Restaurant, Menu, User , Consumer, Address, Notification,  Discount} = require('../models');
const { Op } = require('sequelize');
const { mealPlanConfig, mealFrequencyConfig } = require('../config/applicationConfig');


const calculateNumberOfOrders = (mealPlan, mealFrequency) => {
  // Get the total number of days from the meal plan
  const totalDays = mealPlanConfig[mealPlan];
  if (!totalDays) {
    throw new Error(`Invalid meal plan: ${mealPlan}`);
  }

  // Get the allowed days of the week from the meal frequency
  const allowedDays = mealFrequencyConfig[mealFrequency];
  if (!allowedDays) {
    throw new Error(`Invalid meal frequency: ${mealFrequency}`);
  }

  // Calculate the number of orders
  let numberOfOrders = 0;
  const currentDate = new Date();

  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = currentDate.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    if (allowedDays.includes(dayOfWeek)) {
      numberOfOrders++;
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return numberOfOrders;
};


const calculateAdjustedMenuPrice = (menuPrice, discount) => {
  if (!discount || !discount.discountEnabled) {
    return menuPrice; // No discount applied
  }

  const { discountType, discountValue } = discount;

  if (discountType === 'amount') {
    return Math.max(menuPrice - discountValue, 0); // Ensure price doesn't go below 0
  } else if (discountType === 'percentage') {
    return Math.max(menuPrice - (menuPrice * discountValue) / 100, 0); // Ensure price doesn't go below 0
  }

  return menuPrice; // Default to original price if discount type is invalid
};

const calculatePaymentAmount = (numberOfOrders, adjustedMenuPrice) => {
  return numberOfOrders * adjustedMenuPrice;
};

exports.createSubscription = async (req, res) => {
  try {
    const {
      consumerId,
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
    const menu = await Menu.findByPk(menuId, {
      include: {
        model: Discount,
        as: 'discount', // Include discount data
      },
    });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Fetch the currentAddressId from the Consumer table
    const consumer = await Consumer.findByPk(consumerId);
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    const addressId = consumer.currentAddressId; // Get the current address ID from the Consumer

    // Calculate the number of orders
    const numberOfOrders = calculateNumberOfOrders(mealPlan, mealFrequency, startDate, endDate);

    // Calculate the adjusted menu price
    const adjustedMenuPrice = calculateAdjustedMenuPrice(menu.price, menu.discount);

    // Calculate the payment amount
    const paymentAmount = calculatePaymentAmount(numberOfOrders, adjustedMenuPrice);
    
    // Extract close dates from closeDays array
    const adjustedEndDate = adjustSubscriptionEndDate(startDate, endDate, restaurant.closeDays, mealFrequency);
    // Create the subscription
    const subscription = await Subscription.create({
      consumerId,
      restaurantId,
      menuId,
      categoryName,
      mealPlan,
      mealFrequency,
      startDate,
      endDate : adjustedEndDate,
      addressId,
      paymentAmount, // Set the calculated payment amount
      status: 'pending', // Default status
    });


    if (consumer) {
      await Notification.create({
        ReceiverId: restaurant.userId,
        SenderId: consumer.userId,
        NotificationMessage: `A new subscription has been requested by "${consumer.name}" for the menu "${menu.menuName}".`,
        NotificationType: 'Subscription Request',
        NotificationMetadata: { subscriptionId: subscription.id },
      });
    }

    res.status(201).json({ message: 'Subscription created successfully', subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
const adjustSubscriptionEndDate = (startDate, endDate, closeDays, mealFrequency) => {
  const subscriptionStart = new Date(startDate);
  let subscriptionEnd = new Date(endDate);

  // Get allowed delivery days for the meal frequency
  const allowedDays = mealFrequencyConfig[mealFrequency];
  if (!allowedDays) {
    return subscriptionEnd; // Or throw an error if you want strict validation
  }

  if (closeDays && Array.isArray(closeDays)) {
    // Only consider close days that are within the subscription period and on allowed delivery days
    const overlappingCloseDays = closeDays.filter(closeDay => {
      const closeDate = new Date(closeDay);
      const isWithinRange = closeDate >= subscriptionStart && closeDate <= subscriptionEnd;
      const isAllowedDay = allowedDays.includes(closeDate.getDay());
      return isWithinRange && isAllowedDay;
    });

    if (overlappingCloseDays.length > 0) {
      subscriptionEnd.setDate(subscriptionEnd.getDate() + overlappingCloseDays.length);
    }
  }

  return subscriptionEnd;
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
        { model: Consumer, as: 'customer' },
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
        { model: Consumer, as: 'customer' },
        { model: Restaurant, as: 'restaurant' },
        { model: Menu, as: 'menu' },
        {
          model: Address,
          as: 'address'     },
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
    const userId = req.user.id;

    // Find the consumer by userId
    const consumer = await Consumer.findOne({ where: { userId } });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found for this user' });
    }

    // Find subscriptions by consumerId
    const subscriptions = await Subscription.findAll({
      where: { consumerId: consumer.id },
      include: [
        { model: Consumer, as: 'customer' },
        { model: Restaurant, as: 'restaurant' },
        { model: Menu, as: 'menu' },
      ],
    });

       // Fetch and attach address for each subscription
    const subscriptionsWithAddress = await Promise.all(
      subscriptions.map(async (sub) => {
        const address = sub.addressId ? await Address.findByPk(sub.addressId) : null;
        return {
          ...sub.toJSON(),
          address,
        };
      })
    );


    res.status(200).json({ subscriptions: subscriptionsWithAddress });
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
        { model: Consumer, as: 'customer' },
        { model: Restaurant, as: 'restaurant' },
        { model: Menu, as: 'menu' },
         {
          model: Address,
          as: 'address'     },
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

    // Find the subscription by ID and include the Consumer model
    const subscription = await Subscription.findByPk(id, {
      include: [{ model: Consumer, as: 'customer' }], // Include the Consumer model to get userId
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update the status
    subscription.status = status;
    await subscription.save();

    // If the status is approved, generate orders
    if (status === 'approved') {
      const { startDate, endDate, mealFrequency, restaurantId, menuId, addressId } = subscription;
      const userId = subscription.consumerId; // Retrieve userId from the associated Consumer

      const orders = [];
      const currentDate = new Date(startDate);

      // Determine allowed days based on mealFrequency
      const allowedDays = mealFrequencyConfig[mealFrequency];
      if (!allowedDays) {
        return res.status(400).json({ message: `Invalid meal frequency: ${mealFrequency}` });
      }

      while (currentDate <= new Date(endDate)) {
        const dayOfWeek = currentDate.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

        // Create orders only for allowed days
        if (allowedDays.includes(dayOfWeek)) {
          const orderNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(); // Generate random 16-digit number
          // Normalize the date to only include the date component
      const normalizedDate = new Date(currentDate);
      normalizedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
          orders.push({
            subscriptionId: subscription.id,
            userId, // Set the userId correctly
            restaurantId,
            menuId,
            addressId,
            orderDate: normalizedDate, // Use the current date in the iteration
            status: 'pending', // Default order status
            orderNumber, // Add the generated order number
          });
        }

        // Increment the date by 1 day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Bulk create orders
      await Order.bulkCreate(orders);
    }

 // Check if the restaurant exists
    const restaurant = await Restaurant.findByPk(subscription.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

      // Fetch the currentAddressId from the Consumer table
    const consumer = await Consumer.findByPk(subscription.consumerId);
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

     // Check if the menu exists
    const menu = await Menu.findByPk(subscription.menuId);
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

 await Notification.create({
        ReceiverId: consumer.userId,
        SenderId: restaurant.userId,
        NotificationMessage: `Your subscription has been ${status} by the restaurant ${restaurant.companyName} for the menu "${menu.menuName}".`,
        NotificationType: 'Subscription Status Update',
        NotificationMetadata: { subscriptionId: subscription.id },
      });

    res.status(200).json({ message: 'Subscription status updated successfully', subscription });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

/**
 * Helper to validate and parse paused dates from the request body.
 * Returns an array of valid Date objects or sends a 400 response if invalid.
 */
function parseAndValidatePausedDates(pausedDates, res) {
  if (!pausedDates || !Array.isArray(pausedDates) || pausedDates.length === 0) {
    res.status(400).json({ message: 'An array of paused dates is required' });
    return null;
  }
  // Convert to Date objects and filter out invalid dates
  const validDates = pausedDates.map(date => new Date(date)).filter(date => !isNaN(date));
  if (validDates.length !== pausedDates.length) {
    res.status(400).json({ message: 'Invalid dates provided in the array' });
    return null;
  }
  return validDates;
}

/**
 * Helper to get allowed delivery days for a meal frequency.
 * Returns an array of allowed days (0=Sunday, 1=Monday, ...).
 */
function getAllowedDeliveryDays(mealFrequency, res) {
  const allowedDays = mealFrequencyConfig[mealFrequency];
  if (!allowedDays) {
    res.status(400).json({ message: `Invalid meal frequency: ${mealFrequency}` });
    return null;
  }
  return allowedDays;
}

/**
 * Helper to filter paused dates to only valid delivery days.
 */
function filterPausedDeliveryDays(validDates, allowedDays) {
  return validDates.filter(date => allowedDays.includes(date.getDay()));
}

/**
 * Helper to fetch the restaurant and its close dates.
 */
async function getRestaurantCloseDates(restaurantId) {
  const restaurant = await Restaurant.findByPk(restaurantId);
  let closeStart = null;
  let closeEnd = null;
  
  // Check if restaurant has closeDays array
  if (restaurant?.closeDays && Array.isArray(restaurant.closeDays) && restaurant.closeDays.length > 0) {
    // Sort the dates to get start and end
    const sortedDates = restaurant.closeDays.sort();
    closeStart = new Date(sortedDates[0]);
    closeEnd = new Date(sortedDates[sortedDates.length - 1]);
  }
  
  return { closeStart, closeEnd };
}

/**
 * Helper to extend the subscription end date by the correct number of valid delivery days,
 * skipping restaurant close days and non-delivery days.
 */
function calculateExtendedEndDate(originalEndDate, daysToAdd, allowedDays, closeStart, closeEnd) {
  let newEndDate = new Date(originalEndDate);
  let added = 0;
  while (added < daysToAdd) {
    newEndDate.setDate(newEndDate.getDate() + 1);
    const dayOfWeek = newEndDate.getDay();
    const isAllowedDay = allowedDays.includes(dayOfWeek);
    const isClosed = closeStart && closeEnd && newEndDate >= closeStart && newEndDate <= closeEnd;
    if (isAllowedDay && !isClosed) {
      added++;
    }
  }
  return newEndDate;
}

/**
 * PATCH /subscriptions/:id/pause
 * Pauses a subscription for specific dates, extends the end date, and updates orders.
 */
exports.pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params; // Subscription ID
    const { pausedDates } = req.body; // Array of dates to be paused

    // Step 1: Validate and parse paused dates
    const validDates = parseAndValidatePausedDates(pausedDates, res);
    if (!validDates) return;

    // Step 2: Find the subscription
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Step 3: Get allowed delivery days for the meal frequency
    const allowedDays = getAllowedDeliveryDays(subscription.mealFrequency, res);
    if (!allowedDays) return;

    // Step 4: Filter paused dates to only valid delivery days
    const pausedDeliveryDays = filterPausedDeliveryDays(validDates, allowedDays);

    // Step 5: Mark orders for paused days as canceled
    await markOrdersAsCanceled(subscription.id, pausedDeliveryDays);

    // Step 6: Calculate the number of paused delivery days
    const pausedDaysCount = pausedDeliveryDays.length;

    // Step 7: Fetch restaurant close dates
    const { closeStart, closeEnd } = await getRestaurantCloseDates(subscription.restaurantId);

    // Step 8: Extend the subscription end date, skipping close days and non-delivery days
    const newEndDate = calculateExtendedEndDate(
      subscription.endDate,
      pausedDaysCount,
      allowedDays,
      closeStart,
      closeEnd
    );
    subscription.endDate = newEndDate;
    subscription.pausedDates = pausedDeliveryDays;
    await subscription.save();

    // Step 9: Create new orders for the extended days
    await createOrdersForExtendedDays(subscription, pausedDaysCount);

    // Step 10: Respond with updated subscription
    res.status(200).json({
      message: 'Subscription end date updated successfully based on paused dates',
      subscription,
    });
  } catch (error) {
    console.error('Error updating subscription end date:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};


const markOrdersAsCanceled = async (subscriptionId, pausedDeliveryDays) => {
  try {
     // Normalize pausedDeliveryDays to match the database format
    const normalizedPausedDays = pausedDeliveryDays.map(date => {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
      return normalizedDate;
    });
    await Order.update(
      { status: 'cancelled' },
      {
        where: {
          subscriptionId,
          orderDate: {
            [Op.in]: normalizedPausedDays,
          },
        },
      }
    );

    console.log(`Orders for subscription ${subscriptionId} on paused days marked as canceled.`);
  } catch (error) {
    console.error('Error marking orders as canceled:', error);
    throw error;
  }
};

const createOrdersForExtendedDays = async (subscription, pausedDaysCount) => {
  try {
    const { mealFrequency, endDate, restaurantId, menuId, addressId, consumerId } = subscription;

    // Determine allowed days based on meal frequency
    const allowedDays = mealFrequencyConfig[mealFrequency];
    if (!allowedDays) {
      throw new Error(`Invalid meal frequency: ${mealFrequency}`);
    }

    // Create new orders for the extended days
    const currentDate = new Date(endDate);
    const newEndDate = new Date(new Date(endDate).getTime() + pausedDaysCount * 24 * 60 * 60 * 1000);
    const newOrders = [];

    while (currentDate <= newEndDate) {
      const dayOfWeek = currentDate.getDay();
      if (allowedDays.includes(dayOfWeek)) {
        const orderNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(); // Generate random 16-digit order number

        newOrders.push({
          subscriptionId: subscription.id,
          userId: consumerId,
          restaurantId,
          menuId,
          addressId,
          orderDate: new Date(currentDate),
          status: 'pending',
          orderNumber,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await Order.bulkCreate(newOrders);
    console.log(`Created ${newOrders.length} new orders for subscription ${subscription.id}.`);
  } catch (error) {
    console.error('Error creating orders for extended days:', error);
    throw error;
  }
};


exports.resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params; // Subscription ID

    // Find the subscription by ID
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if the subscription is paused
    if (subscription.status !== 'paused') {
      return res.status(400).json({ message: 'Subscription is not paused' });
    }

    // Update the subscription status to active and clear pause-related fields
    subscription.status = 'active';
    subscription.pausedAt = null;
    subscription.pauseEndDate = null;
    await subscription.save();

    res.status(200).json({ message: 'Subscription resumed successfully', subscription });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params; // Subscription ID
    const { paymentStatus } = req.body; // New payment status

    // Validate the payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: `Invalid payment status. Valid statuses are: ${validPaymentStatuses.join(', ')}` });
    }

    // Find the subscription by ID
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update the payment status
    subscription.paymentStatus = paymentStatus;
    await subscription.save();

    res.status(200).json({ message: 'Payment status updated successfully', subscription });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getSubscriptionConfig = (req, res) => {
  try {
    const subscriptionConfig = {
      mealPlanConfig,
      mealFrequencyConfig,
    };

    res.status(200).json(subscriptionConfig);
  } catch (error) {
    console.error('Error fetching subscription config:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};