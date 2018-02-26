// 错误处理中间件

const errorMiddleware = () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      ctx.status = error.status || 500
      ctx.body = error.message
      ctx.app.emit('error', error, ctx)
    }
  }
}


module.exports = errorMiddleware
