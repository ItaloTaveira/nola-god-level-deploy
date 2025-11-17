const { Pool } = require('pg');

// Support two modes:
// 1) DATABASE_URL environment variable (typical in managed platforms like Render/Heroku)
// 2) Individual DB_* variables for local/docker-compose setups
let pool;

// Create a Pool defensively. Some environments provide a DATABASE_URL that
// may be malformed or require special handling; wrap in try/catch and fall
// back to individual env vars when needed.
function mask(s) {
  if (!s) return '***';
  if (s.length <= 12) return '***';
  return s.slice(0, 6) + '...' + s.slice(-6);
}

function looksLikeConnectionString(s) {
  if (!s || typeof s !== 'string') return false;
  // basic check: must contain :// (protocol) and not be a simple host:port
  return /:\/\//.test(s);
}

function createPool() {
  if (process.env.DATABASE_URL) {
    if (!looksLikeConnectionString(process.env.DATABASE_URL)) {
      console.error('DATABASE_URL appears to be set but does not look like a connection string. Falling back to individual DB_* env vars. masked:', mask(process.env.DATABASE_URL));
    } else {
      try {
        // When running in managed environments the connection often requires SSL.
        // We set rejectUnauthorized to false to be tolerant of managed certs (Render, Heroku).
        // If you want stricter validation, provide a proper CA and remove this option.
        pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
      } catch (err) {
        console.error('Failed to create PG Pool from DATABASE_URL:', err && err.stack ? err.stack : err, 'masked DATABASE_URL:', mask(process.env.DATABASE_URL));
        pool = undefined;
      }
    }
  }

  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      user: process.env.DB_USER || 'challenge',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'challenge_db'
    });
  }

  // Run a quick connection test and log detailed errors if it fails.
  pool.query('SELECT 1').catch((err) => {
    console.error('Initial DB connection test failed:', err && err.stack ? err.stack : err);
  });
}

createPool();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
