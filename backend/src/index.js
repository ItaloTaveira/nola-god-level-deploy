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

// docs
setupSwagger(app);

// expose openapi JSON so tools (Insomnia/Postman) can import the spec
app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

// Serve frontend static files (built into ../public by the Dockerfile)
const path = require('path');
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// SPA fallback: for any non-API route, serve index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/openapi.json') return next();
  res.sendFile(path.join(publicPath, 'index.html'));
});

// error handler (should be last middleware)
app.use(errorHandler);

const port = process.env.PORT || 8000;
let server;

function setupGracefulShutdown(pool) {
  const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    try {
      if (server && server.close) {
        await new Promise((resolve) => server.close(resolve));
      }
      if (pool && typeof pool.end === 'function') {
        await pool.end();
      }
      console.log('Shutdown complete');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown', err && err.stack ? err.stack : err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason && reason.stack ? reason.stack : reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err && err.stack ? err.stack : err);
    // Let the shutdown handler take care of exiting after logging
    shutdown('uncaughtException');
  });
}

if (require.main === module) {
  server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
  // lazy-require db to avoid circulars; if db exports a pool we can close it
  try {
    const db = require('./db');
    setupGracefulShutdown(db && db.pool ? db.pool : null);
  } catch (e) {
    // If db can't be required for some reason, still set up handlers without pool
    setupGracefulShutdown(null);
  }
}

module.exports = app;
