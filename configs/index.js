const addresses = require('./addresses')
const colors = require('./colors')
const envs = require('./envs')
const mimes = require('./mimes')
const oss = require('./oss')
const schema = require('./schema')
const secrets = require('./secrets')
const smtps = require('./smtps')
const validates = require('./validates')


module.exports = {
  ...addresses,
  ...colors,
  ...envs,
  ...mimes,
  ...oss,
  ...schema,
  ...secrets,
  ...smtps,
  ...validates,
}
