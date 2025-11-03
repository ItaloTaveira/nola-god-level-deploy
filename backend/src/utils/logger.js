const debug = process.env.NODE_ENV !== 'production';

const info = (...args) => {
  if (debug) console.info('[info]', ...args);
};
const error = (...args) => {
  console.error('[error]', ...args);
};
const warn = (...args) => {
  if (debug) console.warn('[warn]', ...args);
};

module.exports = { info, error, warn };
