'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

// Import the Sequelize instance from models
const { sequelize } = require('./models');

// Import routes
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const deliveryPartnerRoutes = require('./routes/deliveryPartnerRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const menuRoutes = require('./routes/menuRoutes'); // Import menu routes
const notificationRoutes = require('./routes/notificationRoutes'); // Import notification routes
const statisticRoutes = require('./routes/statisticRoutes'); // Import statistic routes

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/delivery-partners', deliveryPartnerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menus', menuRoutes); // Add menu routes
app.use('/api/notifications', notificationRoutes); // Add notification routes
app.use('/api/statistics', statisticRoutes); // Add statistic routes

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Daily Meals Subscription Backend!');
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Sync database and start server
const PORT = process.env.PORT || 3000;
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });
