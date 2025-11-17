// Enhanced DB connectivity tester with fallbacks and diagnostics.
// Usage examples:
//  DATABASE_URL="postgres://..." node tools/test_db_connection.js
//  DB_HOST=localhost DB_USER=challenge DB_NAME=challenge_db node tools/test_db_connection.js

const { Client } = require('pg');
const dns = require('dns');
const net = require('net');

function maskConn(s) {
  if (!s) return s;
  return s.replace(/:(?:[^:@]+)@/, ':*****@');
}

function parseDatabaseUrl(conn) {
  try {
    const u = new URL(conn);
    return {
      host: u.hostname,
      port: u.port || '5432',
      user: u.username,
      password: u.password,
      database: u.pathname ? u.pathname.replace(/^\//, '') : undefined,
      params: u.search
    };
  } catch (e) {
    return null;
  }
}

async function checkTcp(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      done = true;
      socket.destroy();
      resolve({ ok: true });
    });
    socket.on('timeout', () => {
      if (!done) { done = true; socket.destroy(); resolve({ ok: false, reason: 'timeout' }); }
    });
    socket.on('error', (err) => {
      if (!done) { done = true; resolve({ ok: false, reason: err.code || err.message }); }
    });
    socket.connect(Number(port), host);
  });
}

async function tryClientConnect(cfg) {
  const isLocalHost = cfg.host === 'localhost' || cfg.host === '127.0.0.1' || cfg.host === '::1';
  const sslOption = isLocalHost ? false : { rejectUnauthorized: false };
  const client = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    ssl: sslOption
  });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as ok');
    await client.end();
    return { ok: true, rows: res.rows };
  } catch (err) {
    try { await client.end(); } catch (e) {}
    return { ok: false, error: err };
  }
}

async function main() {
  const conn = process.env.DATABASE_URL;
  if (conn) console.log('Testing DB connection to:', maskConn(conn));

  // If DATABASE_URL provided, try it first (even if format is postgresql://)
  if (conn) {
    const parsed = parseDatabaseUrl(conn);
    if (!parsed) {
      console.error('DATABASE_URL exists but could not be parsed. Will attempt DNS/port checks.');
    } else {
      // Try TCP check first to give faster diagnostics on network issues
      console.log(`Resolving host ${parsed.host} and testing TCP ${parsed.host}:${parsed.port}...`);
      try {
        const lookup = await dns.promises.lookup(parsed.host);
        console.log('DNS lookup OK, address:', lookup.address);
      } catch (e) {
        console.error('DNS lookup failed for host', parsed.host, e && e.code ? e.code : e.message || e);
      }
      const tcp = await checkTcp(parsed.host, parsed.port || 5432, 4000);
      if (!tcp.ok) console.error('TCP connectivity to', `${parsed.host}:${parsed.port}`, 'failed:', tcp.reason);

      const tryRes = await tryClientConnect(parsed);
      if (tryRes.ok) {
        console.log('Connected OK, query result:', tryRes.rows[0]);
        process.exit(0);
      }
      console.error('Connection using DATABASE_URL failed:', tryRes.error && tryRes.error.message ? tryRes.error.message : tryRes.error);
    }
  }

  // Fallback: try DB_* environment variables (useful for local dev)
  const fallback = {
    host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
    port: process.env.DB_PORT || process.env.PGPORT || '5432',
    user: process.env.DB_USER || process.env.PGUSER || 'challenge',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
    database: process.env.DB_NAME || process.env.PGDATABASE || 'challenge_db'
  };

  console.log('Attempting fallback to DB_* env vars or defaults:', `${fallback.user}@${fallback.host}:${fallback.port}/${fallback.database}`);
  try {
    const lookup = await dns.promises.lookup(fallback.host);
    console.log('DNS lookup OK, address:', lookup.address);
  } catch (e) {
    console.error('DNS lookup failed for host', fallback.host, e && e.code ? e.code : e.message || e);
  }
  const tcp2 = await checkTcp(fallback.host, fallback.port, 4000);
  if (!tcp2.ok) console.error('TCP connectivity to', `${fallback.host}:${fallback.port}`, 'failed:', tcp2.reason);

  const tryRes2 = await tryClientConnect(fallback);
  if (tryRes2.ok) {
    console.log('Connected OK using fallback config, query result:', tryRes2.rows[0]);
    process.exit(0);
  }

  console.error('Fallback connection failed:', tryRes2.error && tryRes2.error.message ? tryRes2.error.message : tryRes2.error);
  console.error('\nSuggestions:');
  console.error('- If you want to test the Render Postgres, use the full connection string from the Render panel and ensure your network allows outbound TCP to port 5432.');
  console.error("- For local Postgres, either run Postgres locally or set DB_HOST=localhost and DB_USER/DB_PASSWORD/DB_NAME accordingly.");
  console.error('- If password has special characters, ensure it is URL-encoded in DATABASE_URL.');
  process.exit(1);
}

main();
