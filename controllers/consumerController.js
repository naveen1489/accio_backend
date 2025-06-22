const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Order, User, Consumer, Address, Restaurant , Menu, MenuCategory } = require('../models');
const { Op } = require('sequelize');
const haversine = require('haversine-distance'); // Use haversine-distance for distance calculation

// Create consumer
exports.createConsumer = async (req, res) => {
  try {
    const { password, confirmPassword, name, mobile, email, profilePic } = req.body;

    // Validate password and confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if the mobile number is already registered in the User table
    const existingUser = await User.findOne({ where: { username: mobile } });
    if (existingUser) {
      return res.status(400).json({ message: 'Mobile number is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the User entry
    const user = await User.create({
      username: mobile, // Use mobile as the username
      password: hashedPassword,
      role: 'customer', // Set the role to 'customer'
    });

    // Create the Consumer entry
    const consumer = await Consumer.create({
      userId: user.id,
      name,
      mobile,
      email,
      profilePic,
      status: 'pending', // Default status
    });

    res.status(201).json({ message: 'Consumer created successfully', consumer });
  } catch (error) {
    console.error('Error creating consumer:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Login consumer
exports.loginConsumer = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Find the user by mobile (username)
    const user = await User.findOne({ where: { username: mobile, role: 'customer' } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token valid for 1 day
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in consumer:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update consumer
exports.updateConsumer = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { name, mobile, email, profilePic, status } = req.body;

    // Find the consumer by userId (not by PK)
    const consumer = await Consumer.findOne({ where: { userId } });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    // Update fields if provided
    consumer.name = name || consumer.name;
    consumer.mobile = mobile || consumer.mobile;
    consumer.email = email || consumer.email;
    consumer.profilePic = profilePic || consumer.profilePic;
    consumer.status = status || consumer.status;

    // Save the updated consumer
    await consumer.save();

    res.status(200).json({ message: 'Consumer updated successfully', consumer });
  } catch (error) {
    console.error('Error updating consumer:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Delete consumer
exports.deleteConsumer = async (req, res) => {
  try {
    const { id } = req.params; // Consumer ID

    // Find the consumer by ID
    const consumer = await Consumer.findByPk(id);
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    // Delete the associated User entry
    await User.destroy({ where: { id: consumer.userId } });

    // Delete the consumer
    await consumer.destroy();

    res.status(200).json({ message: 'Consumer deleted successfully' });
  } catch (error) {
    console.error('Error deleting consumer:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get consumer by ID
exports.getConsumerById = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the consumer by userId
    const consumer = await Consumer.findOne({
      where: { userId },
      include: [{ model: User, as: 'user' }],
    });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    res.status(200).json({ consumer });
  } catch (error) {
    console.error('Error fetching consumer:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Create Address
exports.createAddress = async (req, res) => {
  try {
    const { addressTag, name, addressLine1, addressLine2, city, state, pincode, mobile, latitude, longitude } = req.body;

    // Get userId from JWT
    const userId = req.user.id;

    // Find the consumer by userId
    const consumer = await Consumer.findOne({ where: { userId } });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    // Create the address
    const address = await Address.create({
      consumerId: consumer.id,
      addressTag,
      name: addressTag === 'other' ? name : null, // Only set name if addressTag is "other"
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      mobile,
      latitude,
      longitude,
    });

    // If the consumer doesn't have a current address, set this as the default address
    if (!consumer.currentAddressId) {
      consumer.currentAddressId = address.id;
      await consumer.save();
    }

    res.status(201).json({ message: 'Address created successfully', address });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Get Addresses by Consumer ID
exports.getAddressesByConsumerId = async (req, res) => {
  try {
    // Get userId from JWT
    const userId = req.user.id;

    // Find the consumer by userId
    const consumer = await Consumer.findOne({ where: { userId } });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    // Fetch addresses for the consumer
    const addresses = await Address.findAll({ where: { consumerId: consumer.id } });

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ message: 'No addresses found for this consumer' });
    }

    res.status(200).json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const { addressTag, name, addressLine1, addressLine2, city, state, pincode, mobile, latitude, longitude } = req.body;

    // Find the address by ID
    const address = await Address.findByPk(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Update fields
    address.addressTag = addressTag || address.addressTag;
    address.name = addressTag === 'other' ? name : null;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 || address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;
    address.mobile = mobile || address.mobile;
    address.latitude = latitude || address.latitude;
    address.longitude = longitude || address.longitude;

    await address.save();

    res.status(200).json({ message: 'Address updated successfully', address });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the address by ID
    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await address.destroy();

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.updateCurrentAddress = async (req, res) => {
  try {
    // Get userId from JWT
    const userId = req.user.id;
    const { addressId } = req.body;

    // Find the consumer by userId
    const consumer = await Consumer.findOne({ where: { userId } });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    // Check if the address exists and belongs to the consumer
    const address = await Address.findOne({ where: { id: addressId, consumerId: consumer.id } });
    if (!address) {
      return res.status(404).json({ message: 'Address not found or does not belong to the consumer' });
    }

    // Update the current address
    consumer.currentAddressId = addressId;
    await consumer.save();

    res.status(200).json({ message: 'Current address updated successfully', consumer });
  } catch (error) {
    console.error('Error updating current address:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.searchMenus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, vegNonVeg, minPrice, maxPrice, page = 1 } = req.query;

    console.log('--- searchMenus called ---');
    console.log('userId from JWT:', userId);
    console.log('Query params:', req.query);

    // Find the consumer's current address
    const consumer = await Consumer.findOne({ where: { userId } });
    console.log('Consumer:', consumer ? consumer.toJSON() : null);

    if (!consumer || !consumer.currentAddressId) {
      console.log('Consumer or current address not found');
      return res.status(404).json({ message: 'Consumer or current address not found' });
    }

    const currentAddress = await Address.findByPk(consumer.currentAddressId);
    console.log('Current Address:', currentAddress ? currentAddress.toJSON() : null);

    if (!currentAddress) {
      console.log('Current address not found');
      return res.status(404).json({ message: 'Current address not found' });
    }

    const currentLocation = {
      latitude: parseFloat(currentAddress.latitude),
      longitude: parseFloat(currentAddress.longitude),
    };
    console.log('Current Location:', currentLocation);

    // Fetch all active restaurants
    const restaurants = await Restaurant.findAll({
      where: { status: 'Active' },
      attributes: ['id', 'latitude', 'longitude'],
    });
    console.log('Fetched restaurants count:', restaurants.length);

    // Filter restaurants within 5 km
    const restaurantDistances = {};
    const nearbyRestaurants = restaurants.filter((restaurant) => {
      const restaurantLocation = {
        latitude: parseFloat(restaurant.latitude),
        longitude: parseFloat(restaurant.longitude),
      };
      const distance = haversine(currentLocation, restaurantLocation) / 1000; // km
      // Debug log for each restaurant
      console.log(
        `Restaurant ID: ${restaurant.id}, Distance: ${distance.toFixed(2)} km`
      );
       restaurantDistances[restaurant.id] = distance;
      return distance <= 5;
    });
    const nearbyRestaurantIds = nearbyRestaurants.map((restaurant) => restaurant.id);
    console.log('Nearby restaurant IDs:', nearbyRestaurantIds);

    if (nearbyRestaurantIds.length === 0) {
      console.log('No restaurants found within 5 km');
      return res.status(200).json({ message: 'No restaurants found within 5 km', menus: [] });
    }

    // Build menu filter
    const menuWhere = {
      restaurantId: { [Op.in]: nearbyRestaurantIds },
      status: 'Approved',
    };
    //if (category) menuWhere.category = category;
    if (vegNonVeg) menuWhere.vegNonVeg = vegNonVeg;
    if (minPrice) menuWhere.price = { ...(menuWhere.price || {}), [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) menuWhere.price = { ...(menuWhere.price || {}), [Op.lte]: parseFloat(maxPrice) };

    console.log('Menu filter:', menuWhere);

    // Build include for MenuCategory with categoryName filter
    const menuCategoryInclude = {
      model: MenuCategory,
      as: 'menuCategories',
      required: !!category, // Only require join if filtering by category
      ...(category && {
        where: { categoryName: category }
      })
    };

    // Fetch menus with filters and pagination
    const offset = (page - 1) * 10;
    const menus = await Menu.findAndCountAll({
      where: menuWhere,
      limit: 10,
      offset,
        include: [
          menuCategoryInclude,
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name'],
        },
      ],
    });

    console.log('Menus found:', menus.count);

  // Add restaurantName and distance to each menu in the response
    const menusWithRestaurant = menus.rows.map(menu => {
      const menuObj = menu.toJSON();
      const restaurant = menuObj.restaurant;
      const distance = restaurant ? restaurantDistances[restaurant.id] : null;
      return {
        ...menuObj,
        restaurantName: restaurant ? restaurant.name : null,
        distance: distance !== undefined ? Number(distance.toFixed(2)) : null, // in km, rounded to 2 decimals
      };
    });

    res.status(200).json({
      message: 'Menus fetched successfully',
      totalMenus: menus.count,
      totalPages: Math.ceil(menus.count / 10),
      currentPage: parseInt(page),
      menus: menusWithRestaurant,
    });
  } catch (error) {
    console.error('Error searching menus:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.getOrdersForConsumer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, startDate, endDate, page = 1 } = req.query;

    // Find the consumer by userId
    const consumer = await Consumer.findOne({ where: { userId } });
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    // Build filter
    const where = {
      userId: consumer.id,
      orderDate: { [Op.lte]: new Date() }, // till today
    };
    if (status) where.status = status;
    if (startDate) where.orderDate[Op.gte] = new Date(startDate);
    if (endDate) where.orderDate[Op.lte] = new Date(endDate);

    const limit = 10;
    const offset = (page - 1) * limit;

    // Fetch orders with menu and restaurant info
    const orders = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'menuName', 'price'],
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(200).json({
      message: 'Orders fetched successfully',
      totalOrders: orders.count,
      totalPages: Math.ceil(orders.count / limit),
      currentPage: parseInt(page),
      orders: orders.rows,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};