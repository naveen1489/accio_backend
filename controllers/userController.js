'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, OTP } = require('../models');

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
  

  exports.sendOtp = async (req, res) => {
    try {
      const { username } = req.body;

        // Check if the username exists in the User table
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
      // Generate a 6-digit random OTP
      //const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp = "123456"; // For testing purposes, use a fixed OTP
      // Set expiration time (90 seconds from now)
      const expiresAt = new Date(Date.now() + 90 * 1000);
  
 // Check if an OTP record already exists for the username
 const existingOtp = await OTP.findOne({ where: { username } });


 if (existingOtp) {
  // Update the existing OTP record
  existingOtp.otp = otp;
  existingOtp.expiresAt = expiresAt;
  await existingOtp.save();
} else {
  // Create a new OTP record
  await OTP.create({ username, otp, expiresAt });
}
  
      // Generate a JWT token with OTP pending verification
      const token = jwt.sign(
        {id: user.id, username, otpVerified: false },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // Token expires in 10 minutes
      );
  
      // Send OTP via SMS (replace with actual SMS sending logic)
      console.log(`Sending OTP ${otp} to user ${username}`);
  
      res.status(200).json({ message: 'OTP sent successfully', token });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };

  exports.verifyOtp = async (req, res) => {
    try {
      const { username, otp } = req.body;
      const token = req.headers.authorization?.split(' ')[1];
  
      // Validate the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.username !== username || decoded.otpVerified) {
        return res.status(400).json({ message: 'Invalid or already verified token' });
      }
  
      // Find the OTP record for the given username
      const otpRecord = await OTP.findOne({ where: { username, otp } });
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      // Check if the OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        return res.status(400).json({ message: 'OTP has expired' });
      }

      // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
      // OTP is valid, delete it from the database
      await otpRecord.destroy();
  
      // Generate a new JWT token with OTP verified
      const newToken = jwt.sign(
        { id: user.id,username, otpVerified: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // Token expires in 10 minutes
      );
  
      res.status(200).json({ message: 'OTP verified successfully', token: newToken });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };

  exports.resetPassword = async (req, res) => {
    try {
      const { username, newPassword, confirmPassword } = req.body;
      const token = req.headers.authorization?.split(' ')[1];

      const userId = req.user.id;
  
      // Validate the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.username !== username || !decoded.otpVerified) {
        return res.status(400).json({ message: 'Invalid or unverified token' });
      }
  
      // Validate new and confirm password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
  
      // Find the user by username
      const user = await User.findOne({ where: { id: userId, username} });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Hash the new password and update it
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };

  exports.loginDeliveryPartner = async (req, res) => {
    try {
      const { phone } = req.body;
  
      // Find the delivery partner by phone
      const deliveryPartner = await DeliveryPartner.findOne({ where: { phone, status: 'active' } });
      if (!deliveryPartner) {
        return res.status(404).json({ message: 'Delivery partner not found or inactive' });
      }
  
      // Generate a 6-digit random OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Set OTP expiration time (e.g., 5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  
      // Save the OTP in the database (or use a separate OTP table)
      await OTP.create({ phone, otp, expiresAt });
  
      // Send OTP via SMS (replace with actual SMS sending logic)
      console.log(`Sending OTP ${otp} to phone ${phone}`);
  
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error during delivery partner login:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  };