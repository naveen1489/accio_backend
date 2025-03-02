'use strict';

const { Restaurant } = require('../models/restaurant');

// Add Restaurant Partner
exports.addRestaurantPartner = async (req, res) => {
    try {
        const { name, location, owner } = req.body;

        // Check if the restaurant already exists
        const existingRestaurant = await Restaurant.findOne({ where: { name } });
        if (existingRestaurant) return res.status(400).json({ message: 'Restaurant already exists' });

        // Create the restaurant
        const restaurant = await Restaurant.create({ name, location, owner });

        res.status(201).json({ message: 'Restaurant partner added successfully', restaurant });
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
        const { name, location, owner } = req.body;

        const restaurant = await Restaurant.findByPk(id);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        // Update fields if provided
        restaurant.name = name || restaurant.name;
        restaurant.location = location || restaurant.location;
        restaurant.owner = owner || restaurant.owner;

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
