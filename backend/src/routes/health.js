const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  // Use the DB availability flag from db module so we don't block on a query.
  const dbOk = db && typeof db.isConnected === 'function' ? db.isConnected() : false;

  if (dbOk) {
    return res.json({ ok: true, db: 'ok' });
  }

  // DB is not available. Log masked DATABASE_URL to help diagnose, but do not expose secrets.
  try {
    const raw = process.env.DATABASE_URL;
    if (raw) {
      const masked = raw.replace(/:(?:[^:@]+)@/, ':*****@');
      console.error('DATABASE_URL (masked):', masked);
    } else {
      console.error('DATABASE_URL: <not set>');
    }
  } catch (e) {
    console.error('Failed to log masked DATABASE_URL', e && e.stack ? e.stack : e);
  }

  // Control whether health should fail when DB is down.
  const failOnDb = process.env.HEALTH_FAIL_ON_DB === 'true';
  if (failOnDb) {
    return res.status(500).json({ ok: false, db: 'down' });
  }

  // Default: report service as up but DB as down so process remains healthy in PaaS.
  return res.json({ ok: true, db: 'down' });
});

module.exports = router;
