const { createMenu, updateMenu } = require('../controllers/menuController');
const { Menu, MenuCategory, MenuItem, Restaurant, Discount, Notification, User } = require('../models');

// Mock the models
jest.mock('../models');

describe('createMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a menu successfully', async () => {
    // Mock request and response
    const req = {
      body: {
        menuName: 'Test Menu',
        vegNonVeg: 'veg',
        restaurantId: 1,
        menuCategories: [
          {
            categoryName: 'Lunch',
            day: 'Monday',
            menuItems: [
              { itemName: 'Paneer Butter Masala', itemCategory: 'Main Course' },
            ],
          },
        ],
        price: 200,
        discount: {
          discountEnabled: true,
          discountType: 'percentage',
          discountValue: 10,
          discountStartDate: '2025-05-01',
          discountEndDate: '2025-05-31',
        },
      },
    };
  
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  
    // Mock Restaurant.findByPk
    Restaurant.findByPk.mockResolvedValue({ id: 1, name: 'Test Restaurant' });
  
    // Mock Menu.create
    Menu.create.mockResolvedValue({
      id: 1,
      menuName: 'Test Menu',
      imageUrl: undefined,
      description: undefined,
      toJSON: function () {
        return {
          id: this.id,
          menuName: this.menuName,
          imageUrl: this.imageUrl,
          description: this.description,
        };
      },
    });
  
    // Mock MenuCategory.create
    MenuCategory.create.mockResolvedValue({ id: 1, categoryName: 'Lunch' });
  
    // Mock MenuItem.create
    MenuItem.create.mockResolvedValue({ id: 1, itemName: 'Paneer Butter Masala' });
  
    // Mock Discount.create
    Discount.create.mockResolvedValue({ id: 1 });
  
    // Mock User.findOne
    User.findOne.mockResolvedValue({ id: 1 });
  
    // Mock Notification.create
    Notification.create.mockResolvedValue({ id: 1 });
  
    // Call the function
    await createMenu(req, res);
  
    // Assertions
    expect(Restaurant.findByPk).toHaveBeenCalledWith(1);
    expect(Menu.create).toHaveBeenCalledWith({
      menuName: 'Test Menu',
      vegNonVeg: 'veg',
      restaurantId: 1,
      price: 200,
      imageUrl: undefined,
      description: undefined,
    });
    expect(MenuCategory.create).toHaveBeenCalledWith({
      menuId: 1,
      categoryName: 'Lunch',
      day: 'Monday',
    });
    expect(MenuItem.create).toHaveBeenCalledWith({
      menuCategoryId: 1,
      itemName: 'Paneer Butter Masala',
      itemCategory: 'Main Course',
    });
    expect(Discount.create).toHaveBeenCalledWith({
      menuId: 1,
      discountEnabled: true,
      discountType: 'percentage',
      discountValue: 10,
      discountStartDate: '2025-05-01',
      discountEndDate: '2025-05-31',
    });
    expect(Notification.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Menu created successfully',
      menu: {
        id: 1,
        menuName: 'Test Menu',
        imageUrl: undefined,
        description: undefined,
      },
    });
  });

  it('should return 404 if the restaurant is not found', async () => {
    const req = {
      body: {
        menuName: 'Test Menu',
        vegNonVeg: 'veg',
        restaurantId: 1,
        price: 200,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock Restaurant.findByPk
    Restaurant.findByPk.mockResolvedValue(null);

    // Call the function
    await createMenu(req, res);

    // Assertions
    expect(Restaurant.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Restaurant not found' });
  });
});

describe('updateMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a menu successfully', async () => {
    const req = {
      params: { id: 1 },
      body: {
        menuName: 'Updated Menu',
        vegNonVeg: 'non-veg',
        menuCategories: [
          {
            categoryName: 'Lunch',
            menuItems: [
              { itemName: 'Chicken Curry', itemCategory: 'Main Course' },
            ],
          },
        ],
        price: 300,
        restaurantId: 1,
        discount: {
          discountEnabled: true,
          discountType: 'amount',
          discountValue: 50,
        },
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock Menu.findByPk
    Menu.findByPk.mockResolvedValue({
      id: 1,
      menuName: 'Old Menu',
      save: jest.fn(),
    });

    // Mock MenuCategory.findOne
    MenuCategory.findOne.mockResolvedValue({
      id: 1,
      categoryName: 'Lunch',
    });

    // Mock MenuItem.findAll
    MenuItem.findAll.mockResolvedValue([
      { id: 1, itemName: 'Old Item', destroy: jest.fn(), save: jest.fn() },
    ]);

    // Mock MenuItem.create
    MenuItem.create.mockResolvedValue({ id: 2, itemName: 'Chicken Curry' });

    // Mock Discount.findOne
    Discount.findOne.mockResolvedValue({
      id: 1,
      save: jest.fn(),
    });

    // Call the function
    await updateMenu(req, res);

    // Assertions
    expect(Menu.findByPk).toHaveBeenCalledWith(1);
    expect(MenuCategory.findOne).toHaveBeenCalledWith({
      where: { menuId: 1, categoryName: 'Lunch' },
    });
    expect(MenuItem.create).toHaveBeenCalledWith({
      menuCategoryId: 1,
      itemName: 'Chicken Curry',
      itemCategory: 'Main Course',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Menu updated successfully',
      menu: expect.any(Object),
    });
  });

  it('should return 404 if the menu is not found', async () => {
    const req = {
      params: { id: 1 },
      body: {
        menuName: 'Updated Menu',
        price: 300,
        restaurantId: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock Menu.findByPk
    Menu.findByPk.mockResolvedValue(null);

    // Call the function
    await updateMenu(req, res);

    // Assertions
    expect(Menu.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Menu not found' });
  });
});