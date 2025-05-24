"use strict";

const {
  Menu,
  MenuCategory,
  MenuItem,
  Restaurant,
  Notification,
  MenuReview,
  User,
  Discount,
} = require("../models");

// const NotificationService = require('../services/notificationService');

// Create a new menu
exports.createMenu = async (req, res) => {
  try {
    const {
      menuName,
      vegNonVeg,
      restaurantId,
      menuCategories,
      price,
      discount, // Discount JSON object
      imageUrl, // New field for menu image
      description,
    } = req.body;

    // Check if the restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Create the menu
    const menu = await Menu.create({
      menuName,
      vegNonVeg,
      restaurantId,
      price,
      imageUrl,
      description,
    });

    // Add menu categories and items
    if (menuCategories && menuCategories.length > 0) {
      for (const menuCategory of menuCategories) {
        const createdMenuCategory = await MenuCategory.create({
          menuId: menu.id,
          categoryName: menuCategory.categoryName,
          day: menuCategory.day, // New field
        });

        if (menuCategory.menuItems && menuCategory.menuItems.length > 0) {
          for (const menuItem of menuCategory.menuItems) {
            await MenuItem.create({
              menuCategoryId: createdMenuCategory.id,
              itemCategory: menuItem.itemCategory, // New field
              itemName: menuItem.itemName,
            });
          }
        }
      }
    }

    // Add discount if provided
    if (discount && discount.discountEnabled) {
      const {
        discountEnabled,
        discountType,
        discountValue,
        discountStartDate,
        discountEndDate,
      } = discount;

      await Discount.create({
        menuId: menu.id,
        discountEnabled,
        discountType,
        discountValue,
        discountStartDate,
        discountEndDate,
      });
    }

    // Create a notification for the admin
    const user = await User.findOne({
      where: { role: "admin" },
      attributes: ["id"], // Only get the 'id' field
      order: [["createdAt", "DESC"]], // optional: most recent
      limit: 1,
    });

    if (user) {
      await Notification.create({
        ReceiverId: user.id,
        SenderId: restaurantId,
        NotificationMessage: `A new menu "${menuName}" has been created by restaurant "${restaurant.name}".`,
        NotificationType: "Menu Creation",
        NotificationMetadata: { menuId: menu.id },
      });
    }

    res.status(201).json({
      message: "Menu created successfully",
      menu: {
        ...menu.toJSON(),
        imageUrl,
        description,
      },
    });
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Update an existing menu
exports.updateMenu = async (req, res) => {
  console.log("Updating menu with body:", JSON.stringify(req.body, null, 2));
  try {
    const { id } = req.params;
    const {
      menuName,
      vegNonVeg,
      menuCategories,
      price,
      restaurantId,
      discount,
    } = req.body;

    // Validate input data
    if (!menuName || !price || !restaurantId) {
      return res.status(400).json({ message: "Menu name, price, and restaurant ID are required" });
    }

    // Find the menu
    const menu = await Menu.findByPk(id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Update menu details
    menu.menuName = menuName || menu.menuName;
    menu.vegNonVeg = vegNonVeg || menu.vegNonVeg;
    menu.price = price || menu.price;
    await menu.save();

    // Update menu categories and items
    if (menuCategories && menuCategories.length > 0) {
      for (const menuCategory of menuCategories) {
        let category = await MenuCategory.findOne({
          where: { menuId: id, categoryName: menuCategory.categoryName },
        });

        if (category) {
          // Update existing category
          category.day = menuCategory.day || category.day;
          await category.save();
        } else {
          // Create new category
          category = await MenuCategory.create({
            menuId: menu.id,
            categoryName: menuCategory.categoryName,
            day: menuCategory.day,
          });
        }

        // Update or create menu items
        if (menuCategory.menuItems && menuCategory.menuItems.length > 0) {
          for (const menuItem of menuCategory.menuItems) {
            let item = await MenuItem.findOne({
              where: { menuCategoryId: category.id, itemName: menuItem.itemName },
            });

            if (item) {
              // Update existing item
              item.itemCategory = menuItem.itemCategory || item.itemCategory;
              await item.save();
            } else {
              // Create new item
              await MenuItem.create({
                menuCategoryId: category.id,
                itemName: menuItem.itemName,
                itemCategory: menuItem.itemCategory,
              });
            }
          }
        }
      }
    }

    // Handle discount update
    if (discount) {
      const {
        discountEnabled,
        discountType,
        discountValue,
        discountStartDate,
        discountEndDate,
      } = discount;

      let menuDiscount = await Discount.findOne({ where: { menuId: menu.id } });

      if (discountEnabled) {
        if (menuDiscount) {
          // Update existing discount
          menuDiscount.discountEnabled = discountEnabled;
          menuDiscount.discountType = discountType;
          menuDiscount.discountValue = discountValue;
          menuDiscount.discountStartDate = discountStartDate;
          menuDiscount.discountEndDate = discountEndDate;
          await menuDiscount.save();
        } else {
          // Create new discount
          await Discount.create({
            menuId: menu.id,
            discountEnabled,
            discountType,
            discountValue,
            discountStartDate,
            discountEndDate,
          });
        }
      } else if (menuDiscount) {
        // Delete discount if disabled
        await menuDiscount.destroy();
      }
    }

    // Create a notification for the admin
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const user = await User.findOne({
      where: { role: "admin" },
      attributes: ["id"], // Only get the 'id' field
      order: [["createdAt", "DESC"]], // optional: most recent
      limit: 1,
    });

    if (user) {
      await Notification.create({
        ReceiverId: user.id,
        SenderId: restaurantId,
        NotificationMessage: `The menu "${menuName}" has been updated by restaurant "${restaurant.name}".`,
        NotificationType: "Menu Update",
        NotificationMetadata: { menuId: menu.id },
      });
    }

    // Fetch updated menu with discount and categories
    const updatedMenu = await Menu.findByPk(menu.id, {
      include: [
        {
          model: MenuCategory,
          as: "menuCategories",
          include: {
            model: MenuItem,
            as: "menuItems",
          },
        },
        {
          model: Discount,
          as: "discount",
        },
      ],
    });

    res
      .status(200)
      .json({ message: "Menu updated successfully", menu: updatedMenu });
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
// Delete a menu
exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the menu
    const menu = await Menu.findByPk(id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Delete menu categories and items
    await MenuCategory.destroy({ where: { menuId: id } });

    // Delete the menu
    await menu.destroy();

    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all menus by restaurant

exports.getMenusByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Fetch menus for the restaurant
    const menus = await Menu.findAll({
      where: { restaurantId },
      include: [
        {
          model: MenuCategory,
          as: "menuCategories",
          include: {
            model: MenuItem,
            as: "menuItems",
          },
        },
        {
          model: Restaurant,
          as: "restaurant", // Include restaurant data
        },
        {
          model: Discount,
          as: "discount", // Include discount data
        },
      ],
    });

    // Fetch MenuReview data for each menu
    const menusWithReviews = await Promise.all(
      menus.map(async (menu) => {
        const menuReviews = await MenuReview.findAll({
          where: { menuId: menu.id },
        });

        return {
          ...menu.toJSON(),
          menuReviews, // Add menuReviews to the menu object
        };
      })
    );

    res.status(200).json(menusWithReviews);
  } catch (error) {
    console.error("Error fetching menus by restaurant:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all menus by status (veg or non-veg)
exports.getMenusByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const menus = await Menu.findAll({
      where: { status },
      include: [
        {
          model: MenuCategory,
          as: "menuCategories",
          include: {
            model: MenuItem,
            as: "menuItems",
          },
        },
        {
          model: Restaurant,
          as: "restaurant", // Include restaurant data
        },
      ],
    });

    // Fetch MenuReview data for each menu
    const menusWithReviews = await Promise.all(
      menus.map(async (menu) => {
        const menuReviews = await MenuReview.findAll({
          where: { menuId: menu.id },
        });

        return {
          ...menu.toJSON(),
          menuReviews, // Add menuReviews to the menu object
        };
      })
    );

    res.status(200).json(menusWithReviews);
  } catch (error) {
    console.error("Error fetching menus by status:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
// Get menu by ID
exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the menu by ID
    const menu = await Menu.findByPk(id, {
      include: [
        {
          model: MenuCategory,
          as: "menuCategories",
          include: {
            model: MenuItem,
            as: "menuItems",
          },
        },
        {
          model: Restaurant,
          as: "restaurant", // Include restaurant data
        },
        {
          model: Discount,
          as: "discount", // Include discount data
        },
      ],
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Fetch MenuReview data for the menu
    const menuReviews = await MenuReview.findAll({
      where: { menuId: menu.id },
    });

    res.status(200).json({
      ...menu.toJSON(),
      menuReviews, // Add menuReviews to the response
    });
  } catch (error) {
    console.error("Error fetching menu by ID:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get all menus with pagination
exports.getAllMenusWithPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res
        .status(400)
        .json({
          message: "Invalid page number. Page must be a positive integer.",
        });
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      return res
        .status(400)
        .json({ message: "Invalid limit. Limit must be a positive integer." });
    }

    const offset = (pageNumber - 1) * limitNumber;

    const { count: totalMenus, rows: menus } = await Menu.findAndCountAll({
      limit: limitNumber,
      offset: offset,
      include: [
        {
          model: MenuCategory,
          as: "menuCategories",
          include: {
            model: MenuItem,
            as: "menuItems",
          },
        },
        {
          model: Restaurant,
          as: "restaurant", // Include restaurant data
        },
      ],
      distinct: true, // Ensure distinct count of menus
    });

    // Fetch MenuReview data for each menu
    const menusWithReviews = await Promise.all(
      menus.map(async (menu) => {
        const menuReviews = await MenuReview.findAll({
          where: { menuId: menu.id },
        });

        return {
          ...menu.toJSON(),
          menuReviews, // Add menuReviews to the menu object
        };
      })
    );

    const totalPages = Math.ceil(totalMenus / limitNumber);

    res.status(200).json({
      totalMenus,
      totalPages,
      currentPage: pageNumber,
      menus: menusWithReviews,
    });
  } catch (error) {
    console.error("Error fetching menus with pagination:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Add or update menu review status
exports.addOrUpdateMenuReview = async (req, res) => {
  try {
    const { menuId, restaurantId, status, adminComment } = req.body;

    // Validate menu and restaurant existence
    const menu = await Menu.findByPk(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if a review already exists for this menu
    let menuReview = await MenuReview.findOne({
      where: { menuId, restaurantId },
    });

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
        adminComment,
      });
    }

    // Update the status in the Menu table
    if (status) {
      menu.status = status;
      await menu.save();

      // Create a notification for the admin
      const user = await User.findOne({
        where: { role: "admin" },
        attributes: ["id"], // Only get the 'id' field
        order: [["createdAt", "DESC"]], // optional: most recent
        limit: 1,
      });

      if (user) {
        const contactNumber = restaurant.contactNumber;
        const restaurantUserID = await User.findOne({
          where: { username: contactNumber },
          attributes: ["id"], // Only get the 'id' field
          order: [["createdAt", "DESC"]], // optional: most recent
          limit: 1,
        });
        await Notification.create({
          ReceiverId: restaurantUserID.id,
          SenderId: user.id,
          NotificationMessage: `"${restaurant.name}" BlinkDish has "${status}" the menu "${menu.menuName}".`,
          NotificationType: "New Menu Review",
          NotificationMetadata: { menuId: menu.id },
        });
      }
    }

    res
      .status(200)
      .json({ message: "Menu review updated successfully", menuReview, menu });
  } catch (error) {
    console.error("Error updating menu review:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
