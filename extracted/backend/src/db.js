const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'challenge',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'challenge_db'
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
