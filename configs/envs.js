// NODE_ENV

const NODE_ENV = process.env.NODE_ENV


module.exports = {
  NODE_ENV,
  NODE_ENV_PRODUCTION: NODE_ENV === 'production',
  NODE_ENV_DEVELOPMENT: NODE_ENV === 'development',
  NODE_ENV_TEST: NODE_ENV === 'test',
}
