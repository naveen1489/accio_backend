'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Register Admin
exports.registerAdmin = async (req, res) => {
    try {
      console.info('Request for admin register');
        const { username, password } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the admin user
        const admin = await User.create({
            username,
            password: hashedPassword,
            role: 'admin'
        });

        res.status(201).json({ message: 'Admin registered successfully', admin });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the admin user
        const admin = await User.findOne({ where: { username, role: 'admin' } });
        if (!admin) return res.status(400).json({ message: 'Invalid username or password' });

        // Compare the password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

        // Generate JWT token
        const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Find the user by ID
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify the old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

        // Hash the new password and update
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user by ID
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Return user profile data
        res.status(200).json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
/**
 * Login for Restaurant Partners.
 * Expects JSON body: { "username": "partnerUsername", "password": "partnerPassword" }
 * Only users with role "restaurant" will be authenticated.
 */
exports.loginRestaurant = async (req, res) => {
    try {
      const { username, password } = req.body;
      // Find a user with the given username and role "restaurant"
      const restaurantPartner = await User.findOne({ where: { username, role: 'restaurant' } });
      if (!restaurantPartner) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      // Compare provided password with stored hashed password
      const isMatch = await bcrypt.compare(password, restaurantPartner.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: restaurantPartner.id, role: restaurantPartner.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
  
      res.status(200).json({ message: 'Restaurant partner login successful', token });
    } catch (error) {
      console.error('Error during restaurant partner login:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };
  
  /**
   * Login for Delivery Partners.
   * Expects JSON body: { "username": "deliveryUsername", "password": "deliveryPassword" }
   * Only users with role "deliveryPartner" will be authenticated.
   */
  exports.loginDeliveryPartner = async (req, res) => {
    try {
      const { username, password } = req.body;
      // Find a user with the given username and role "deliveryPartner"
      const deliveryPartner = await User.findOne({ where: { username, role: 'deliveryPartner' } });
      if (!deliveryPartner) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      // Compare provided password with stored hashed password
      const isMatch = await bcrypt.compare(password, deliveryPartner.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: deliveryPartner.id, role: deliveryPartner.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
  
      res.status(200).json({ message: 'Delivery partner login successful', token });
    } catch (error) {
      console.error('Error during delivery partner login:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };