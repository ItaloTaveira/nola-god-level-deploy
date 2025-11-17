const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  // Use the DB availability flag from db module so we don't block on a query.
  const dbOk = db && typeof db.isConnected === 'function' ? db.isConnected() : false;
  if (dbOk) return res.json({ ok: true, db: 'ok' });

  // DB is not available. Do not spam logs on every health check — the DB
  // connection diagnostics are already logged by the DB module at startup.
  // Control whether health should fail when DB is down.
  const failOnDb = process.env.HEALTH_FAIL_ON_DB === 'true';
  if (failOnDb) return res.status(500).json({ ok: false, db: 'down' });

  // Default: report service as up but DB as down so process remains healthy in PaaS.
  return res.json({ ok: true, db: 'down' });
});

module.exports = router;
