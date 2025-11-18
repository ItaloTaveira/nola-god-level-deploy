const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    // quick DB check
    await db.query('SELECT 1');
    res.json({ ok: true, db: 'ok' });
  } catch (err) {
    console.error('DB health check failed', err.message || err);
    res.status(500).json({ ok: false, db: 'error', error: err.message || String(err) });
  }
});

module.exports = router;
