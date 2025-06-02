const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Consumer, Address } = require('../models');
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
      status: 'active', // Default status
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
    const id = req.user.id;
    const { name, mobile, email, profilePic, status } = req.body;

    // Find the consumer by ID
    const consumer = await Consumer.findByPk(id);
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
    const id = req.user.id;

    // Find the consumer by ID
    const consumer = await Consumer.findByPk(id, {
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
    const {addressTag, name, addressLine1, addressLine2, city, state, pincode, mobile, latitude, longitude } = req.body;

    const consumerId = req.user.id;
    // Check if the consumer exists
    const consumer = await Consumer.findByPk(consumerId);
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    // Create the address
    const address = await Address.create({
      consumerId,
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
    console.log('Got Request for get Addresses by Consumer ID'); 
    // Extract consumerId from the decoded JWT (req.user)
    const consumerId = req.user.id;
    console.log('consumerId:', consumerId); 

    // Fetch addresses for the consumer
    const addresses = await Address.findAll({ where: { consumerId } });

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
    const  id  = req.user.id;
    const { addressTag, name, addressLine1, addressLine2, city, state, pincode, mobile, latitude, longitude } = req.body;

    // Find the address by ID
    const address = await Address.findByPk(id);
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
   const consumerId = req.user.id; // Get the consumer ID from the authenticated user
    const { addressId } = req.body;

    // Check if the consumer exists
    const consumer = await Consumer.findByPk(consumerId);
    if (!consumer) {
      return res.status(404).json({ message: 'Consumer not found' });
    }

    // Check if the address exists and belongs to the consumer
    const address = await Address.findOne({ where: { id: addressId, consumerId } });
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