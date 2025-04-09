'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Set default value for existing NULL entries
        await queryInterface.sequelize.query(`
            UPDATE "Restaurants"
            SET "imageUrl" = ''
            WHERE "imageUrl" IS NULL
        `);

        // Alter the column type to TEXT
        await queryInterface.changeColumn('Restaurants', 'imageUrl', {
            type: Sequelize.TEXT,
            allowNull: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the column type to STRING
        await queryInterface.changeColumn('Restaurants', 'imageUrl', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },
};
