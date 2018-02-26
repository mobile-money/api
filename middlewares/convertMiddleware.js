const _ = require('lodash')
const compose = require('koa-compose')
const bodyMiddleware = require('koa-body')

const authMiddleware = require('./authMiddleware')
const validateMiddleware = require('./validateMiddleware')
const BaseController = require('../controllers/BaseController')


/**
 * 把一个对象转换为 koa-router 可接受的中间件
 * @param {Object} config 配置
 * @param {Function} config.controller 控制器
 * @param {String} config.property 使用控制器中的哪个属性
 * @param {Object} [config.schema] 参数验证模型，使用 joi 验证
 * @param {Boolean} [config.auth=false] 是否验证用户已经登录
 * @param {Boolean} [config.verified=false] 如果 config.auth 为 true，是否验证用户已经验证邮箱
 * @param {Boolean} [config.passthrough=false] 如果 config.auth 为 true，且验证失败，是否还继续执行下面的中间件
 * @param {Boolean} [config.body=false] 是否解析 body
 * @param {Boolean} [config.multipart=false] 解析 body 时，是否解析 multipart
 * @return {Function} 合并后的中间件
 */
const convert = config => {
  const {
    controller: Controller,
    property,
    schema,
    auth = false,
    verified = false,
    passthrough = false,
    body = false,
    multipart = false,
  } = config

  const middlewares = []

  if (!_.isFunction(Controller)) throw new TypeError('The `controller` muse be a class')
  if (!property || !_.isString(property)) throw new TypeError('The `property` must be a string')

  if (auth) middlewares.push(authMiddleware({ verified, passthrough }))
  if (body) middlewares.push(bodyMiddleware({ multipart }))
  if (schema) middlewares.push(validateMiddleware(schema))

  const convertMiddleware = async ctx => {
    const instance = new Controller(ctx)

    if (!(instance instanceof BaseController)) throw new TypeError('The `controller` must extend BaseController')
    if (!_.isFunction(instance[property])) throw new TypeError('The `controller` must exist `property` property, and the `property` must be a function')

    await instance[property](ctx.state.data)
  }

  middlewares.push(convertMiddleware)

  return compose(middlewares)
}


module.exports = convert
