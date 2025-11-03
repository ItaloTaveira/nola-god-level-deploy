const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.message || String(err));
  res.status(500).json({ ok: false, error: err.message || 'Internal Error' });
}

module.exports = errorHandler;
