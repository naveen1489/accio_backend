'use strict';

const { Subscription, Order, Restaurant, Menu, User , Consumer, Address, Notification,  Discount} = require('../models');


const mealPlanConfig = {
  '1 Week': 7,
  '2 Week': 14,
  '3 Week': 21,
  '4 Week': 28,
};

const mealFrequencyConfig = {
  'Mon-Fri': [1, 2, 3, 4, 5], // Monday to Friday
  'Mon-Sat': [1, 2, 3, 4, 5, 6], // Monday to Saturday
  'Mon-Sun': [1, 2, 3, 4, 5, 6, 7], // All days of the week
};

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

    // Create the subscription
    const subscription = await Subscription.create({
      consumerId,
      restaurantId,
      menuId,
      categoryName,
      mealPlan,
      mealFrequency,
      startDate,
      endDate,
      addressId,
      paymentAmount, // Set the calculated payment amount
      status: 'pending', // Default status
    });

    // Notify the restaurant
    const contactNumber = restaurant.contactNumber;
    const restaurantUser = await User.findOne({
      where: { username: contactNumber },
      attributes: ['id'], // Only get the 'id' field
    });

    if (consumer) {
      await Notification.create({
        ReceiverId: restaurantUser.id,
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
        { model: Consumer, as: 'customer' },
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
     console.log('User ID:', userId); // Debugging
      const orders = [];
      const currentDate = new Date(startDate);

      while (currentDate <= new Date(endDate)) {
        // Add orders based on meal frequency
       // if (mealFrequency === 'daily' || (mealFrequency === 'alternate' && currentDate.getDate() % 2 === 0)) {
          const orderNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(); // Generate random 16-digit number
          orders.push({
            subscriptionId: subscription.id,
            userId, // Set the userId correctly
            restaurantId,
            menuId,
            addressId, 
            orderDate: new Date(),
            status: 'pending', // Default order status
            orderNumber, // Add the generated order number
          });
      //  }

        // Increment the date by 1 day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Bulk create orders
      await Order.bulkCreate(orders);
    }

    res.status(200).json({ message: 'Subscription status updated successfully', subscription });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params; // Subscription ID
    const { pauseStartDate, pauseEndDate } = req.body; // Pause start and end dates

    // Validate the pause dates
    if (!pauseStartDate || !pauseEndDate) {
      return res.status(400).json({ message: 'Pause start and end dates are required' });
    }

    const startDate = new Date(pauseStartDate);
    const endDate = new Date(pauseEndDate);

    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Pause end date must be after the start date' });
    }

    // Find the subscription by ID
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if the subscription is already paused or cancelled
    if (subscription.status === 'paused') {
      return res.status(400).json({ message: 'Subscription is already paused' });
    }
    if (subscription.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pause a cancelled subscription' });
    }

    // Calculate the number of paused days
    const pausedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // Difference in days

    // Update the subscription status to paused and adjust the end date
    subscription.status = 'paused';
    subscription.endDate = new Date(new Date(subscription.endDate).getTime() + pausedDays * 24 * 60 * 60 * 1000); // Extend endDate
    subscription.pausedAt = startDate; // Save the pause start date
    subscription.pauseEndDate = endDate; // Save the pause end date
    await subscription.save();

    res.status(200).json({ message: 'Subscription paused successfully', subscription });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
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