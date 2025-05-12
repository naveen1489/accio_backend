'use strict';

const { User } = require('../models'); // Assuming you have a User model

// Fetch all users from the database
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll(); // Fetch all users
    res.status(200).json({
      message: 'Users fetched successfully',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};