const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    // quick DB check
    await db.query('SELECT 1');
    res.json({ ok: true, db: 'ok' });
  } catch (err) {
    // Log full stack for debugging, but avoid printing raw DATABASE_URL here.
    const full = err && err.stack ? err.stack : err;
    console.error('DB health check failed', full);

    // Log a masked DATABASE_URL indicator to help diagnose malformed values without exposing secrets.
    try {
      const raw = process.env.DATABASE_URL;
      if (raw) {
        // mask password if present: postgres://user:PASS@host/... -> postgres://user:*****@host/...
        const masked = raw.replace(/:(?:[^:@]+)@/, ':*****@');
        console.error('DATABASE_URL (masked):', masked);
      } else {
        console.error('DATABASE_URL: <not set>');
      }
    } catch (e) {
      // do not let masking errors hide the original error
      console.error('Failed to log masked DATABASE_URL', e && e.stack ? e.stack : e);
    }

    res.status(500).json({ ok: false, db: 'error', error: err && err.message ? err.message : String(err) });
  }
});

module.exports = router;
