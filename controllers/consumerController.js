const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Consumer } = require('../models');

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
    const { id } = req.params; // Consumer ID
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
    const { id } = req.params; // Consumer ID

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

// Get all consumers
exports.getAllConsumers = async (req, res) => {
  try {
    // Find all consumers
    const consumers = await Consumer.findAll({
      include: [{ model: User, as: 'user' }],
    });

    res.status(200).json({ consumers });
  } catch (error) {
    console.error('Error fetching consumers:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};