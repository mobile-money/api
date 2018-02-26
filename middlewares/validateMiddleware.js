// 参数验证

const { CustomJoi } = require('../services')


const validateMiddleware = schema => {
  const validateBody = !!schema.body
  const validateQuery = !!schema.query
  const validateParams = !!schema.params

  return async (ctx, next) => {
    const value = {}

    if (validateBody) value.body = ctx.request.body
    if (validateQuery) value.query = ctx.query
    if (validateParams) value.params = ctx.params

    const result = CustomJoi.validate(value, schema)

    if (result.error) {
      ctx.status = 400
      ctx.message = result.error.message
      return
    }

    const { body = {}, query = {}, params = {} } = result.value

    ctx.state.data = { ...body, ...query, ...params }

    await next()
  }
}


module.exports = validateMiddleware
