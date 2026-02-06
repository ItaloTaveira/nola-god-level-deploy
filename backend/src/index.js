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
const fs = require('fs');
const publicPath = path.join(__dirname, '..', 'public');
// Desabilita cache para evitar servir bundles antigos no navegador
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(express.static(publicPath, { etag: false, lastModified: false, cacheControl: false }));

// SPA fallback: for any non-API route, serve index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/openapi.json') return next();
  res.sendFile(path.join(publicPath, 'index.html'));
});

// error handler (should be last middleware)
app.use(errorHandler);

const port = process.env.PORT || 8000;
if (require.main === module) {
  const indexExists = fs.existsSync(path.join(publicPath, 'index.html'));
  let assetsInfo = '';
  try {
    const assetsDir = path.join(publicPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      assetsInfo = `assets: ${files.length} files`;
    } else {
      assetsInfo = 'assets: directory missing';
    }
  } catch (e) {
    assetsInfo = `assets: check failed (${e && e.message ? e.message : 'error'})`;
  }

  console.log(`Static public path: ${publicPath}`);
  console.log(`index.html present: ${indexExists}`);
  console.log(assetsInfo);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
