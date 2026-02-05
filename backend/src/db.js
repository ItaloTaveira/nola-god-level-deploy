const { Pool } = require('pg');

// Lazy pool: só cria conexão quando a primeira query for executada.
let pool;

function getPool() {
  if (pool) return pool;

  if (process.env.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
    } catch (err) {
      console.error('Failed to create PG Pool from DATABASE_URL:', err && err.stack ? err.stack : err);
      pool = undefined;
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

  return pool;
}

module.exports = {
  query: (text, params) => getPool().query(text, params),
  getPool
};
