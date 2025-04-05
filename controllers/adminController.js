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
        const { categoryName, vegNonVeg, description, status, itemCategories } = req.body;

        // Find the category
        const category = await Category.findByPk(id, {
            include: {
                model: ItemCategory,
                as: 'itemCategories',
                include: {
                    model: Item,
                    as: 'items'
                }
            }
        });

        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Update category details
        category.categoryName = categoryName || category.categoryName;
        category.vegNonVeg = vegNonVeg || category.vegNonVeg;
        category.description = description || category.description;
        category.status = status || category.status;
        await category.save();

        // Update itemCategories
        if (itemCategories && itemCategories.length > 0) {
            // Track existing itemCategory IDs
            const existingItemCategoryIds = category.itemCategories.map(ic => ic.id);

            for (const itemCategory of itemCategories) {
                if (itemCategory.id) {
                    // Update existing itemCategory
                    if (existingItemCategoryIds.includes(itemCategory.id)) {
                        const existingItemCategory = await ItemCategory.findByPk(itemCategory.id, {
                            include: { model: Item, as: 'items' }
                        });

                        existingItemCategory.itemCategoryName = itemCategory.itemCategoryName || existingItemCategory.itemCategoryName;
                        await existingItemCategory.save();

                        // Update items in the itemCategory
                        if (itemCategory.items && itemCategory.items.length > 0) {
                            const existingItemIds = existingItemCategory.items.map(item => item.id);

                            for (const item of itemCategory.items) {
                                if (item.id) {
                                    // Update existing item
                                    if (existingItemIds.includes(item.id)) {
                                        const existingItem = await Item.findByPk(item.id);
                                        existingItem.itemName = item.itemName || existingItem.itemName;
                                        await existingItem.save();
                                    }
                                } else {
                                    // Add new item
                                    await Item.create({
                                        itemCategoryId: existingItemCategory.id,
                                        itemName: item.itemName
                                    });
                                }
                            }

                            // Remove items that are no longer in the updated list
                            const updatedItemIds = itemCategory.items.map(item => item.id).filter(id => id);
                            await Item.destroy({
                                where: {
                                    id: { [Op.notIn]: updatedItemIds },
                                    itemCategoryId: existingItemCategory.id
                                }
                            });
                        }
                    }
                } else {
                    // Add new itemCategory
                    const newItemCategory = await ItemCategory.create({
                        categoryId: category.id,
                        itemCategoryName: itemCategory.itemCategoryName
                    });

                    // Add items to the new itemCategory
                    if (itemCategory.items && itemCategory.items.length > 0) {
                        for (const item of itemCategory.items) {
                            await Item.create({
                                itemCategoryId: newItemCategory.id,
                                itemName: item.itemName
                            });
                        }
                    }
                }
            }

            // Remove itemCategories that are no longer in the updated list
            const updatedItemCategoryIds = itemCategories.map(ic => ic.id).filter(id => id);
            await ItemCategory.destroy({
                where: {
                    id: { [Op.notIn]: updatedItemCategoryIds },
                    categoryId: category.id
                }
            });
        }

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