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
  if (process.env.DATABASE_URL) {
    const sanitized = sanitizeConnectionString(process.env.DATABASE_URL);
    if (!looksLikeConnectionString(sanitized)) {
      const masked = mask(sanitized || process.env.DATABASE_URL);
      const msg = `DATABASE_URL is set but invalid (masked: ${masked}). ` +
        `Please fix the variable or unset it to use individual DB_* env vars.`;
      console.error(msg);
      // Leave pool undefined so we can decide next steps. Do not auto-fallback.
    } else {
      try {
        pool = new Pool({
          connectionString: sanitized,
          ssl: { rejectUnauthorized: false }
        });
      } catch (err) {
        console.error('Failed to create PG Pool from DATABASE_URL:', err && err.stack ? err.stack : err, 'masked DATABASE_URL:', mask(sanitized));
        // If pool creation fails, do not silently fallback — surface the error.
        throw err;
      }
    }
  }

  // If DATABASE_URL wasn't used to create a pool, and explicit DB_* vars are
  // provided, use them. If neither is available, create a pool pointing to
  // localhost only if running in development (NODE_ENV !== 'production').
  if (!pool) {
    const hasDbEnv = process.env.DB_HOST || process.env.DB_USER || process.env.DB_NAME || process.env.DB_PASSWORD || process.env.DB_PORT;
    if (!hasDbEnv && process.env.NODE_ENV === 'production') {
      const err = new Error('No valid DATABASE_URL or DB_* environment variables found in production. Set DATABASE_URL to a reachable Postgres connection string.');
      console.error(err.message);
      throw err;
    }

    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    const sslOption = isLocalHost ? false : { rejectUnauthorized: false };

    pool = new Pool({
      host,
      port,
      user: process.env.DB_USER || 'challenge',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'challenge_db',
      ssl: sslOption
    });
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
