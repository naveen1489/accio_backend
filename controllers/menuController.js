'use strict';

const { Menu, MenuCategory, MenuItem, Restaurant, Notification, MenuReview  } = require('../models');

//const NotificationService = require('../services/notificationService');

// Create a new menu
exports.createMenu = async (req, res) => {
    try {
        const { menuName, vegNonVeg, restaurantId, menuCategories } = req.body;

        // Check if the restaurant exists
        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Create the menu
        const menu = await Menu.create({
            menuName,
            vegNonVeg,
            restaurantId
        });

        // Add menu categories and items
        if (menuCategories && menuCategories.length > 0) {
            for (const menuCategory of menuCategories) {
                const createdMenuCategory = await MenuCategory.create({
                    menuId: menu.id,
                    categoryName: menuCategory.categoryName,
                    day: menuCategory.day // New field
                });

                if (menuCategory.menuItems && menuCategory.menuItems.length > 0) {
                    for (const menuItem of menuCategory.menuItems) {
                        await MenuItem.create({
                            menuCategoryId: createdMenuCategory.id,
                            itemCategory: menuItem.itemCategory, // New field
                            itemName: menuItem.itemName
                        });
                    }
                }
            }
        }

        // Create a notification for the admin
        await Notification.create({
            ReceiverId: '988b76f8-66e6-4d5c-ab5b-01257395c1c6', // Replace with the actual admin ID
            SenderId: restaurantId, // The restaurant ID is the sender
            NotificationMessage: `A new menu "${menuName}" has been created by restaurant "${restaurant.name}".`,
            NotificationType: 'menu_creation',
            NotificationMetadata: { menuId: menu.id }
        });

        res.status(201).json({ message: 'Menu created successfully', menu });
    } catch (error) {
        console.error('Error creating menu:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Update an existing menu
exports.updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { menuName, vegNonVeg, menuCategories } = req.body;

        // Find the menu
        const menu = await Menu.findByPk(id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        // Update menu details
        menu.menuName = menuName || menu.menuName;
        menu.vegNonVeg = vegNonVeg || menu.vegNonVeg;
        await menu.save();

        // Update menu categories and items
        if (menuCategories && menuCategories.length > 0) {
            // Delete existing menu categories and items
            await MenuCategory.destroy({ where: { menuId: id } });

            for (const menuCategory of menuCategories) {
                const createdMenuCategory = await MenuCategory.create({
                    menuId: menu.id,
                    categoryName: menuCategory.categoryName
                });

                if (menuCategory.menuItems && menuCategory.menuItems.length > 0) {
                    for (const menuItem of menuCategory.menuItems) {
                        await MenuItem.create({
                            menuCategoryId: createdMenuCategory.id,
                            itemName: menuItem.itemName
                        });
                    }
                }
            }
        }

        // Create a notification for the admin
        await NotificationService.createNotification({
            ReceiverId: 'admin-id', // Replace with the actual admin ID
            SenderId: menu.restaurantId, // The restaurant ID is the sender
            NotificationMessage: `The menu "${menuName}" has been updated.`,
            NotificationType: 'menu_update',
            NotificationMetadata: { menuId: menu.id }
        });

        res.status(200).json({ message: 'Menu updated successfully', menu });
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
// Delete a menu
exports.deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the menu
        const menu = await Menu.findByPk(id);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        // Delete menu categories and items
        await MenuCategory.destroy({ where: { menuId: id } });

        // Delete the menu
        await menu.destroy();

        res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get all menus by restaurant
exports.getMenusByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const menus = await Menu.findAll({
            where: { restaurantId },
            include: {
                model: MenuCategory,
                as: 'menuCategories',
                include: {
                    model: MenuItem,
                    as: 'menuItems'
                }
            }
        });

        res.status(200).json(menus);
    } catch (error) {
        console.error('Error fetching menus by restaurant:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get all menus by status (veg or non-veg)
exports.getMenusByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const menus = await Menu.findAll({
            where: { status: status },
            include: {
                model: MenuCategory,
                as: 'menuCategories',
                include: {
                    model: MenuItem,
                    as: 'menuItems'
                }
            }
        });

        res.status(200).json(menus);
    } catch (error) {
        console.error('Error fetching menus by status:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get menu by ID
exports.getMenuById = async (req, res) => {
    try {
        const { id } = req.params;

        const menu = await Menu.findByPk(id, {
            include: {
                model: MenuCategory,
                as: 'menuCategories',
                include: {
                    model: MenuItem,
                    as: 'menuItems'
                }
            }
        });

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        res.status(200).json(menu);
    } catch (error) {
        console.error('Error fetching menu by ID:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get all menus with pagination
exports.getAllMenusWithPagination = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

        // Ensure page and limit are integers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        if (isNaN(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ message: 'Invalid page number. Page must be a positive integer.' });
        }

        if (isNaN(limitNumber) || limitNumber < 1) {
            return res.status(400).json({ message: 'Invalid limit. Limit must be a positive integer.' });
        }

        // Calculate offset
        const offset = (pageNumber - 1) * limitNumber;

        // Fetch menus with pagination
        const { count: totalMenus, rows: menus } = await Menu.findAndCountAll({
            limit: limitNumber,
            offset: offset,
            include: {
                model: MenuCategory,
                as: 'menuCategories',
                include: {
                    model: MenuItem,
                    as: 'menuItems'
                }
            },
            distinct: true // Ensure distinct count of menus
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalMenus / limitNumber);

        // Return paginated response
        res.status(200).json({
            totalMenus,
            totalPages,
            currentPage: pageNumber,
            menus
        });
    } catch (error) {
        console.error('Error fetching menus with pagination:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};



// Add or update menu review status
exports.addOrUpdateMenuReview = async (req, res) => {
    try {
        const { menuId, restaurantId, status, adminComment } = req.body;

        // Validate menu and restaurant existence
        const menu = await Menu.findByPk(menuId);
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Check if a review already exists for this menu
        let menuReview = await MenuReview.findOne({ where: { menuId, restaurantId } });

        if (menuReview) {
            // Update existing review
            menuReview.status = status || menuReview.status;
            menuReview.adminComment = adminComment || menuReview.adminComment;
            await menuReview.save();
        } else {
            // Create a new review
            menuReview = await MenuReview.create({
                menuId,
                restaurantId,
                status,
                adminComment
            });
        }

        res.status(200).json({ message: 'Menu review updated successfully', menuReview });
    } catch (error) {
        console.error('Error updating menu review:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};