const { Pool } = require('pg');

// Support two modes:
// 1) DATABASE_URL environment variable (typical in managed platforms like Render/Heroku)
// 2) Individual DB_* variables for local/docker-compose setups
let pool;
let dbAvailable = false;

// Create a Pool defensively. Some environments provide a DATABASE_URL that
// may be malformed or require special handling; wrap in try/catch and fall
// back to individual env vars when needed.
function mask(s) {
  if (!s) return '***';
  if (s.length <= 12) return '***';
  return s.slice(0, 6) + '...' + s.slice(-6);
}

function sanitizeConnectionString(s) {
  if (!s || typeof s !== 'string') return s;
  let out = s.trim();
  // remove surrounding angle brackets often used in docs: <postgres://...>
  if (out.startsWith('<') && out.endsWith('>')) {
    out = out.slice(1, -1).trim();
  }
  // remove surrounding single or double quotes
  if ((out.startsWith('"') && out.endsWith('"')) || (out.startsWith("'") && out.endsWith("'"))) {
    out = out.slice(1, -1).trim();
  }
  return out;
}

function looksLikeConnectionString(s) {
  if (!s || typeof s !== 'string') return false;
  try {
    // use WHATWG URL parser to validate; will throw for invalid strings
    // This accepts postgres://... connection strings
    // eslint-disable-next-line no-new
    new URL(s);
    return true;
  } catch (e) {
    return false;
  }
}

function createPool() {
  // Prefer explicit DB_* environment variables when present (as requested).
  // This makes configuration explicit and matches Render's dashboard variables.
  const hasDbEnv = process.env.DB_HOST || process.env.DB_USER || process.env.DB_NAME || process.env.DB_PASSWORD || process.env.DB_PORT;

  if (hasDbEnv) {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

    // Always set ssl rejectUnauthorized to false to allow Render's managed
    // Postgres TLS connection (Render requires SSL, but self-signed certs).
    const sslOption = { rejectUnauthorized: false };

    try {
      pool = new Pool({
        host,
        port,
        user: process.env.DB_USER || 'challenge',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'challenge_db',
        ssl: sslOption
      });
    } catch (err) {
      console.error('Failed to create PG Pool from DB_* env vars:', err && err.stack ? err.stack : err);
      throw err;
    }
  } else if (process.env.DATABASE_URL) {
    // Fall back to DATABASE_URL when explicit vars are not provided.
    const sanitized = sanitizeConnectionString(process.env.DATABASE_URL);
    if (!looksLikeConnectionString(sanitized)) {
      const masked = mask(sanitized || process.env.DATABASE_URL);
      const msg = `DATABASE_URL is set but invalid (masked: ${masked}). ` +
        `Please fix the variable or set DB_* env vars.`;
      console.error(msg);
      throw new Error(msg);
    }

    try {
      pool = new Pool({
        connectionString: sanitized,
        ssl: { rejectUnauthorized: false }
      });
    } catch (err) {
      console.error('Failed to create PG Pool from DATABASE_URL:', err && err.stack ? err.stack : err, 'masked DATABASE_URL:', mask(sanitized));
      throw err;
    }
  } else {
    // No DB configuration found. In development, allow a sensible default.
    if (process.env.NODE_ENV === 'production') {
      const err = new Error('No DB configuration found. Set DB_* env vars or DATABASE_URL.');
      console.error(err.message);
      throw err;
    }

    // Development fallback to localhost without SSL
    try {
      pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'challenge',
        password: '',
        database: 'challenge_db',
        ssl: false
      });
    } catch (err) {
      console.error('Failed to create PG Pool for local development:', err && err.stack ? err.stack : err);
      throw err;
    }
  }

  // Run a quick connection test with retries in background and set dbAvailable flag.
  const maxRetries = process.env.DB_CONNECT_RETRIES ? Number(process.env.DB_CONNECT_RETRIES) : 5;
  const delayMs = process.env.DB_CONNECT_DELAY_MS ? Number(process.env.DB_CONNECT_DELAY_MS) : 2000;

  (async function testConnectionWithRetries() {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await pool.query('SELECT 1');
        dbAvailable = true;
        console.log('DB connection established');
        return;
      } catch (err) {
        dbAvailable = false;
        console.error(`Initial DB connection test failed (attempt ${attempt}/${maxRetries}):`, err && err.stack ? err.stack : err);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }
    console.error('DB connection could not be established after retries. Application will continue and report DB as unavailable.');
  })();
}

createPool();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  isConnected: () => !!dbAvailable
};
