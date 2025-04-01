'use strict';

const { Restaurant } = require('../models');

// Add Restaurant Partner
exports.addRestaurantPartner = async (req, res) => {
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
            longitude
        } = req.body;

        // Check if the restaurant already exists
        const existingRestaurant = await Restaurant.findOne({ where: { emailId } });
        if (existingRestaurant) return res.status(400).json({ message: 'Restaurant already exists' });

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
            longitude
        });

        res.status(200).json({ message: 'Restaurant partner added successfully', restaurant });
    } catch (error) {
        console.error('Error adding restaurant partner:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
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
            longitude
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

        await restaurant.save();

        res.status(200).json({ message: 'Restaurant updated successfully', restaurant });
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