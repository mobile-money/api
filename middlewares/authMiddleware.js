// 用户认证

const jwtMiddleware = require('koa-jwt')
const moment = require('moment')
const compose = require('koa-compose')

const { User } = require('../models')
const { SECRET_JWT } = require('../configs')


const authMiddleware = (config = {}) => {
  const { verified = false, passthrough = false } = config
  const jwt = jwtMiddleware({ passthrough, secret: SECRET_JWT })

  const auth = async (ctx, next) => {
    const logined = ctx.state.user

    if (logined) {
      let user = await User.findById(logined.id)

      if (!user) {
        ctx.status = 404
        ctx.message = 'The user is not found'
        return
      }

      if (user.disabled) {
        ctx.status = 403
        ctx.message = 'The user is disabled'
        return
      }

      if (verified && !user.verified) {
        ctx.status = 403
        ctx.message = 'The user\'s email is unverified'
        return
      }

      await next()

      const updatedAt = user.updatedAt
      const today = moment(moment().format('YYYY-MM-DD'))

      if (moment(updatedAt).isBefore(today)) {
        user = await User.findById(logined.id)
        user.updatedAt = Date.now()
        await user.save()
      }

    } else {
      await next()
    }
  }

  return compose([jwt, auth])
}


module.exports = authMiddleware
