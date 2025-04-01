'use strict';

const { Category, ItemCategory, Item } = require('../models');

// Add Category
exports.addCategory = async (req, res) => {
    try {
        const { categoryName, vegNonVeg, description, status, itemCategories } = req.body;

        const category = await Category.create({
            categoryName,
            vegNonVeg,
            description,
            status
        });

        if (itemCategories && itemCategories.length > 0) {
            for (const itemCategory of itemCategories) {
                const createdItemCategory = await ItemCategory.create({
                    categoryId: category.id,
                    itemCategoryName: itemCategory.itemCategoryName
                });

                if (itemCategory.items && itemCategory.items.length > 0) {
                    for (const itemName of itemCategory.items) {
                        await Item.create({
                            itemCategoryId: createdItemCategory.id,
                            itemName
                        });
                    }
                }
            }
        }

        res.status(200).json({ message: 'Category added successfully', category });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Get All Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: {
                model: ItemCategory,
                as: 'itemCategories',
                include: {
                    model: Item,
                    as: 'items'
                }
            }
        });

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName, vegNonVeg, description, status } = req.body;

        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        category.categoryName = categoryName || category.categoryName;
        category.vegNonVeg = vegNonVeg || category.vegNonVeg;
        category.description = description || category.description;
        category.status = status || category.status;

        await category.save();

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await category.destroy();

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};