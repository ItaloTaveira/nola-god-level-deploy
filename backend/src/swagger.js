const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nola God Level - Backend API',
      version: '0.1.0',
      description: 'API para analytics de restaurantes (health, metrics, analytics)'
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
module.exports.spec = swaggerSpec;
