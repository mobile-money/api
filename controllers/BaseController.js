// 控制器最基本的类，所有的控制器都必须继承此类

class BaseController {
  constructor (ctx) {
    this.ctx = ctx
    this.error = this.error.bind(this)
  }

  error (status, message) {
    if (status) this.ctx.status = status
    if (message) this.ctx.message = message
  }
}


module.exports = BaseController
