const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
  next();
};

const rangeLimit = (maxDays = 365) => (req, res, next) => {
  const { start, end } = req.query;
  if (start && end) {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return res.status(400).json({ ok: false, error: 'Invalid date format' });
    }
    if (s > e) return res.status(400).json({ ok: false, error: 'start must be <= end' });
    const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    if (diffDays > maxDays) return res.status(400).json({ ok: false, error: `Range too large. Max ${maxDays} days` });
  }
  next();
};

module.exports = { validateRequest, rangeLimit };
