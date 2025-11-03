require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRouter = require('./routes/health');
const metricsRouter = require('./routes/metrics');
const errorHandler = require('./middlewares/errorHandler');
const setupSwagger = require('./swagger');
const swaggerSpec = require('./swagger').spec;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/metrics', metricsRouter);

// error handler (should be last middleware)
app.use(errorHandler);

// docs
setupSwagger(app);

// expose openapi JSON so tools (Insomnia/Postman) can import the spec
app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

const port = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
