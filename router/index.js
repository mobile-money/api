const Router = require('koa-router')
const { convertMiddleware } = require('../middlewares')

const accountRoutes = require('./account')
const artRoutes = require('./art')
const categoryRoutes = require('./category')
const commentRoutes = require('./comment')
const feedRoutes = require('./feed')
const followRoutes = require('./follow')
const noticeRoutes = require('./notice')
const settingRoutes = require('./setting')
const shareRoutes = require('./share')
const starRoutes = require('./star')
const userRoutes = require('./user')

const router = new Router()
const routes = [
  ...accountRoutes,
  ...artRoutes,
  ...categoryRoutes,
  ...commentRoutes,
  ...feedRoutes,
  ...followRoutes,
  ...noticeRoutes,
  ...settingRoutes,
  ...shareRoutes,
  ...shareRoutes,
  ...starRoutes,
  ...userRoutes,
]


routes.forEach(route => {
  const { path, method, ...rest } = route
  router[method.toLowerCase()](path, convertMiddleware(rest))
})


module.exports = router
