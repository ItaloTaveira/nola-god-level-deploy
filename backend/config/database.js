// Central DB config useful for ORMs and shared config
// Exports an object with pg/ORM-friendly options, including SSL settings
const isLocalHost = (host) => {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
};

const getOptions = (overrides = {}) => {
  const connectionString = process.env.DATABASE_URL || null;
  const host = process.env.DB_HOST || (connectionString ? null : 'localhost');
  const sslRequired = (() => {
    if (connectionString) return true;
    if (host) return !isLocalHost(host);
    return false;
  })();

  const ssl = sslRequired ? { require: true, rejectUnauthorized: false } : false;

  return Object.assign({
    dialect: 'postgres',
    dialectOptions: {
      ssl
    }
  }, overrides);
};

module.exports = { getOptions };
