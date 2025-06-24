'use strict';

const { Restaurant, sequelize ,Subscription, Order} = require('../models');
const transporter = require('../services/emailService');
const { User } = require('../models'); // Import the User model
const crypto = require('crypto'); // For generating random password
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const { Op } = require('sequelize');

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

exports.addRestaurantPartner = async (req, res) => {
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        const {
            companyName,
            nameTitle,
            name,
            countryCode,
            contactNumber,
            emailId,
            status,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            latitude,
            longitude,
            imageUrl,
        } = req.body;

        // Check if the restaurant already exists
        const existingRestaurant = await Restaurant.findOne({ where: { emailId } });
        if (existingRestaurant) {
            await transaction.rollback(); 
            return res.status(400).json({ message: 'Restaurant already exists' });
        }


         // Generate a random 8-character password
         const randomPassword = crypto.randomBytes(4).toString('hex'); // Generates an 8-character password

         // Hash the password
         const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash the password with a salt round of 10
 
         // Create a user entry in the User table
         const user = await User.create({
             username: contactNumber, // Use the mobile number as the username
             password: hashedPassword, // Store the hashed password
             role: 'restaurant', // Assign the role as 'restaurant'
             email: emailId
         }, { transaction }); // Pass transaction

        // Create the restaurant
        const restaurant = await Restaurant.create({
            companyName,
            nameTitle,
            name,
            countryCode,
            contactNumber,
            emailId,
            status,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            latitude,
            longitude,
            imageUrl,
            userId: user.id // Associate the restaurant with the user created
        }, { transaction }); // Pass transaction

        // Commit the transaction
        await transaction.commit();

        // Prepare email options
        const mailOptions = {
            from: '"Accio" <youremail@gmail.com>', // Replace with your email
            to: emailId, // Restaurant's email
            subject: 'Welcome to Accio - Your Login Credentials',
            html: addRestoEmailTemplate(name, companyName, contactNumber, randomPassword)
        };

        console.log('Sending email...');
        try {
            let info = await transporter.sendMail(mailOptions);
            console.log('Email sent: %s', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error);
        }
        console.log('Email process completed.');

        res.status(200).json({ 
            message: 'Restaurant partner added successfully', 
            restaurant,
            user 
        });
    } catch (error) {
        await transaction.rollback(); // Rollback transaction on error
        console.error('Error adding restaurant partner:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

const addRestoEmailTemplate = (name, companyName, username, password) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Accio</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            text-align: center;
            color: #555;
          }
          p {
            font-size: 16px;
            line-height: 1.5;
            margin: 20px 0;
          }
          .button {
            display: block;
            width: 200px;
            margin: 20px auto;
            text-align: center;
            padding: 10px 15px;
            font-size: 18px;
            color: #fff;
            background-color: #fdc329;
            text-decoration: none;
            border-radius: 5px;
          }
          .button:hover {
            background-color: #e6b800;
          }
          footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Accio!</h1>
          <p>Dear ${name},</p>
          <p>We are thrilled to welcome your restaurant, <strong>${companyName}</strong>, as a new partner at Accio. Together, we aim to deliver the best dining experiences to our customers.</p>
          <p>Here are your login credentials to access your account:</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Please log in using these credentials and update your password for security purposes.</p>
          <footer>
            &copy; 2025 Accio. All rights reserved.<br>
            <a href="https://www.accio.com/privacy-policy" target="_blank">Privacy Policy</a> | <a href="https://www.accio.com/terms-of-service" target="_blank">Terms of Service</a>
          </footer>
        </div>
      </body>
      </html>
    `;
};

// Get All Restaurant Partners
exports.getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll();
        res.status(200).json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get a Single Restaurant by ID
exports.getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findByPk(id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        res.status(200).json(restaurant);
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.getRestaurantProfile = async (req, res) => {
  try {
    // Extract userId from JWT token (assumes middleware sets req.user)
    const userId = req.user.id;
    console.log('User ID from token:', userId);
    // Fetch the restaurant associated with the userId
    const restaurant = await Restaurant.findOne({ where: { userId } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for the user' });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant profile:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update Restaurant Partner
exports.updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            companyName,
            nameTitle,
            name,
            countryCode,
            contactNumber,
            emailId,
            status,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            latitude,
            longitude,
            imageUrl 
        } = req.body;

        const restaurant = await Restaurant.findByPk(id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        // Update fields if provided
        restaurant.companyName = companyName || restaurant.companyName;
        restaurant.nameTitle = nameTitle || restaurant.nameTitle;
        restaurant.name = name || restaurant.name;
        restaurant.countryCode = countryCode || restaurant.countryCode;
        restaurant.contactNumber = contactNumber || restaurant.contactNumber;
        restaurant.emailId = emailId || restaurant.emailId;
        restaurant.status = status || restaurant.status;
        restaurant.addressLine1 = addressLine1 || restaurant.addressLine1;
        restaurant.addressLine2 = addressLine2 || restaurant.addressLine2;
        restaurant.city = city || restaurant.city;
        restaurant.state = state || restaurant.state;
        restaurant.postalCode = postalCode || restaurant.postalCode;
        restaurant.country = country || restaurant.country;
        restaurant.latitude = latitude || restaurant.latitude;
        restaurant.longitude = longitude || restaurant.longitude;
        restaurant.imageUrl = imageUrl || restaurant.imageUrl; 

        await restaurant.save();

        // Fetch the updated restaurant object
        const updatedRestaurant = await Restaurant.findByPk(id);

        res.status(200).json({ message: 'Restaurant updated successfully', restaurant: updatedRestaurant });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Delete Restaurant Partner
exports.deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findByPk(id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        await restaurant.destroy();

        res.status(200).json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.createDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, email, status, workingHoursStart, workingHoursEnd, restaurantId } = req.body;

    // Check if the restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create the delivery partner
    const deliveryPartner = await DeliveryPartner.create({
      name,
      phone,
      email,
      status,
      workingHoursStart,
      workingHoursEnd,
      restaurantId,
    });

    res.status(201).json({ message: 'Delivery partner created successfully', deliveryPartner });
  } catch (error) {
    console.error('Error creating delivery partner:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.updateDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params; // Delivery Partner ID
    const { name, phone, email, status, workingHoursStart, workingHoursEnd } = req.body;

    // Find the delivery partner by ID
    const deliveryPartner = await DeliveryPartner.findByPk(id);
    if (!deliveryPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    // Update fields if provided
    deliveryPartner.name = name || deliveryPartner.name;
    deliveryPartner.phone = phone || deliveryPartner.phone;
    deliveryPartner.email = email || deliveryPartner.email;
    deliveryPartner.status = status || deliveryPartner.status;
    deliveryPartner.workingHoursStart = workingHoursStart || deliveryPartner.workingHoursStart;
    deliveryPartner.workingHoursEnd = workingHoursEnd || deliveryPartner.workingHoursEnd;

    // Save the updated delivery partner
    await deliveryPartner.save();

    res.status(200).json({ message: 'Delivery partner updated successfully', deliveryPartner });
  } catch (error) {
    console.error('Error updating delivery partner:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.deleteDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params; // Delivery Partner ID

    // Find the delivery partner by ID
    const deliveryPartner = await DeliveryPartner.findByPk(id);
    if (!deliveryPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    // Delete the delivery partner
    await deliveryPartner.destroy();

    res.status(200).json({ message: 'Delivery partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery partner:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getDeliveryPartnersByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params; // Restaurant ID

    // Find all delivery partners for the given restaurant ID
    const deliveryPartners = await DeliveryPartner.findAll({
      where: { restaurantId },
    });

    res.status(200).json({ deliveryPartners });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getDeliveryPartnerById = async (req, res) => {
  try {
    const { id } = req.params; // Delivery Partner ID

    // Find the delivery partner by ID
    const deliveryPartner = await DeliveryPartner.findByPk(id);
    if (!deliveryPartner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    res.status(200).json({ deliveryPartner });
  } catch (error) {
    console.error('Error fetching delivery partner:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.stopSubscription = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from JWT
    const restaurant = await Restaurant.findOne({ where: { userId: userId } }); // Assuming ownerId links the restaurant to the user
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user' });
    }
    restaurant.status = 'Inactive';
    await restaurant.save();
    res.status(200).json({ message: 'Restaurant subscription stopped (set to Inactive)', restaurant });
  } catch (error) {
    console.error('Error stopping subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.startSubscription = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from JWT
    const restaurant = await Restaurant.findOne({ where: { userId: userId } }); // Assuming ownerId links the restaurant to the user
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user' });
    }
    restaurant.status = 'Active';
    await restaurant.save();
    res.status(200).json({ message: 'Restaurant subscription started (set to Active)', restaurant });
  } catch (error) {
    console.error('Error starting subscription:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.updateCloseDates = async (req, res) => {
  try {
    const userId = req.user.id; // Get userId from JWT
    const { closeStartDate, closeEndDate } = req.body;

    // Validate input
    if (!closeStartDate || !closeEndDate) {
      return res.status(400).json({ message: 'Both closeStartDate and closeEndDate are required' });
    }

    const restaurant = await Restaurant.findOne({ where: { userId: userId } });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user' });
    }

 const restaurantId = restaurant.id;

    // Mark orders as canceled for the close dates
    await markOrdersAsCanceled(restaurantId, closeStartDate, closeEndDate);

    // Update subscriptions' end dates
    await updateSubscriptionsEndDate(restaurantId, closeStartDate, closeEndDate);

    // Create new orders for extended days
    await createOrdersForExtendedDays(restaurantId, closeStartDate, closeEndDate);
   
    // Update close dates
    restaurant.closeStartDate = new Date(closeStartDate);
    restaurant.closeEndDate = new Date(closeEndDate);
    await restaurant.save();

    res.status(200).json({ message: 'Close dates updated successfully', restaurant });
  } catch (error) {
    console.error('Error updating close dates:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const markOrdersAsCanceled = async (restaurantId, closeStartDate, closeEndDate) => {
  try {
    const startDate = new Date(closeStartDate);
    const endDate = new Date(closeEndDate);

    // Find and update orders within the close date range
    await Order.update(
      { status: 'cancelled' },
      {
        where: {
          restaurantId : restaurantId,
          orderDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      }
    );

    console.log(`Orders for restaurant ${restaurantId} between ${closeStartDate} and ${closeEndDate} marked as canceled.`);
  } catch (error) {
    console.error('Error marking orders as canceled:', error);
    throw error;
  }
};

const updateSubscriptionsEndDate = async (restaurantId, closeStartDate, closeEndDate) => {
  try {
    const subscriptions = await Subscription.findAll({ where: { restaurantId } });
    const startDate = new Date(closeStartDate);
    const endDate = new Date(closeEndDate);
    const canceledDaysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    for (const subscription of subscriptions) {
      const { endDate } = subscription;

      // Calculate new end date
      const newEndDate = new Date(new Date(endDate).getTime() + canceledDaysCount * 24 * 60 * 60 * 1000);
      subscription.endDate = newEndDate;
      await subscription.save();

      console.log(`Updated end date for subscription ${subscription.id} to ${newEndDate}.`);
    }
  } catch (error) {
    console.error('Error updating subscriptions end dates:', error);
    throw error;
  }
};

const createOrdersForExtendedDays = async (restaurantId, closeStartDate, closeEndDate) => {
  try {
    const subscriptions = await Subscription.findAll({ where: { restaurantId } });
    const startDate = new Date(closeStartDate);
    const endDate = new Date(closeEndDate);
    const canceledDaysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    for (const subscription of subscriptions) {
      const { mealFrequency, endDate, menuId, addressId, consumerId } = subscription;

      // Determine allowed days based on meal frequency
      const allowedDays = mealFrequencyConfig[mealFrequency];
      if (!allowedDays) {
        console.warn(`Invalid meal frequency for subscription ${subscription.id}: ${mealFrequency}`);
        continue;
      }

      // Create new orders for the extended days
      const currentDate = new Date(endDate); // Start from the subscription's original end date
      currentDate.setHours(0, 0, 0, 0); // Normalize time to 00:00:00

      const newEndDate = new Date(endDate.getTime() + canceledDaysCount * 24 * 60 * 60 * 1000);
      newEndDate.setHours(0, 0, 0, 0); // Normalize time to 00:00:00

      const newOrders = [];

      while (currentDate < newEndDate) { // Use `<` instead of `<=` to avoid duplicate orders
        const dayOfWeek = currentDate.getDay();
        if (allowedDays.includes(dayOfWeek)) {
          const orderNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(); // Generate random 16-digit order number

          newOrders.push({
            subscriptionId: subscription.id,
            restaurantId,
            menuId,
            addressId,
            userId: consumerId,
            orderDate: new Date(currentDate), // Use normalized date
            status: 'pending',
            orderNumber, // Use the generated order number
          });
        }
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

      await Order.bulkCreate(newOrders);
      console.log(`Created ${newOrders.length} new orders for subscription ${subscription.id}.`);
    }
  } catch (error) {
    console.error('Error creating orders for extended days:', error);
    throw error;
  }
};