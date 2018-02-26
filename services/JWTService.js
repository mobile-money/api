const jsonwebtoken = require('jsonwebtoken')
const { SECRET_JWT } = require('../configs')


const JWTService = {
  verify: token => jsonwebtoken.verify(token, SECRET_JWT),
  decode: token => jsonwebtoken.decode(token),
  sign: payload => jsonwebtoken.sign(payload, SECRET_JWT),
}


module.exports = JWTService
