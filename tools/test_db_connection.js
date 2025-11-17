// Simple Node script to test DATABASE_URL connectivity
// Usage: DATABASE_URL="postgres://..." node tools/test_db_connection.js
const { Client } = require('pg');

async function main() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('DATABASE_URL is not set. You can also set DB_HOST/DB_USER/DB_NAME etc.');
    process.exit(2);
  }

  console.log('Testing DB connection to:', conn.replace(/:(?:[^:@]+)@/, ':*****@'));
  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as ok');
    console.log('Connected OK, query result:', res.rows[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err && err.stack ? err.stack : err);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

main();
