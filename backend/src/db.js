const { Pool } = require('pg');

// Support multiple modes:
// 1) DATABASE_URL or DATABASE_PUBLIC_URL (managed platforms: Railway/Render/Heroku)
// 2) Individual DB_* variables (local/docker-compose setups)
// 3) PG* or POSTGRES_* variables (Railway/Docker official Postgres image)
let pool;

// Create a Pool defensively. Some environments provide a DATABASE_URL that
// may be malformed or require special handling; wrap in try/catch and fall
// back to individual env vars when needed.
function createPool() {
  // Prefer explicit connection strings first
  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

  if (connectionString) {
    try {
      // When running in managed environments the connection often requires SSL.
      // We set rejectUnauthorized to false to be tolerant of managed certs (Render, Heroku).
      // If you want stricter validation, provide a proper CA and remove this option.
      pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    } catch (err) {
      console.error('Failed to create PG Pool from DATABASE_URL:', err && err.stack ? err.stack : err);
      pool = undefined;
    }
  }

  if (!pool) {
    // Resolve from DB_* first, then PG*, then POSTGRES_* as fallbacks
    const host = process.env.DB_HOST || process.env.PGHOST || 'localhost';
    const port = Number(process.env.DB_PORT || process.env.PGPORT || 5432);
    const user = process.env.DB_USER || process.env.PGUSER || process.env.POSTGRES_USER || 'challenge';
    const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || '';
    const database = process.env.DB_NAME || process.env.PGDATABASE || process.env.POSTGRES_DB || 'challenge_db';

    // Some platforms set SSL via connection params; keep non-SSL by default here
    // If you need SSL on param-based connections, set DATABASE_URL instead.
    pool = new Pool({ host, port, user, password, database });
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
