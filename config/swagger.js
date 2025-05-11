const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Accio Backend API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Accio backend system',
  },
  servers: [
    {
      url: 'http://localhost:3000/', // Base URL for your API
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Optional, but recommended
      },
    },
  },
  security: [
    {
      bearerAuth: [], // Apply globally to all endpoints
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };