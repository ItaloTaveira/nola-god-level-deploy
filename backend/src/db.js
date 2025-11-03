const { Pool } = require('pg');

// Support two modes:
// 1) DATABASE_URL environment variable (typical in managed platforms like Render/Heroku)
// 2) Individual DB_* variables for local/docker-compose setups
let pool;

if (process.env.DATABASE_URL) {
  // When running in managed environments the connection often requires SSL.
  // We set rejectUnauthorized to false to be tolerant of managed certs (Render, Heroku).
  // If you want stricter validation, provide a proper CA and remove this option.
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || 'challenge',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'challenge_db'
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
