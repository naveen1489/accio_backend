'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add the orderNumber column with allowNull: true
    await queryInterface.addColumn('Orders', 'orderNumber', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null temporarily
    });

    // Step 2: Populate orderNumber for existing records with random 16-digit numbers
    const [orders] = await queryInterface.sequelize.query(`SELECT id FROM "Orders"`);

    for (const order of orders) {
      const orderNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(); // Generate random 16-digit number
      await queryInterface.sequelize.query(
        `UPDATE "Orders" SET "orderNumber" = :orderNumber WHERE "id" = :id`,
        {
          replacements: { orderNumber, id: order.id },
        }
      );
    }

    // Step 3: Alter the orderNumber column to make it NOT NULL
    await queryInterface.changeColumn('Orders', 'orderNumber', {
      type: Sequelize.STRING,
      allowNull: false, // Enforce NOT NULL after populating values
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the orderNumber column from the Orders table
    await queryInterface.removeColumn('Orders', 'orderNumber');
  },
};