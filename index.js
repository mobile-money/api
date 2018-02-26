const Koa = require('koa')
const mongoose = require('mongoose')
const corsMiddlware = require('kcors')
const loggerMiddleware = require('koa-logger')

const router = require('./router')
const CONFIGS = require('./configs')
const { errorMiddleware } = require('./middlewares')

const app = new Koa()


mongoose.Promise = Promise
mongoose.connect(CONFIGS.ADDRESS_MONGODB, { useMongoClient: true })


if (CONFIGS.NODE_ENV_DEVELOPMENT) {
  app.use(loggerMiddleware())
  mongoose.connection
    .on('error', error => console.log(error))
    .on('close', () => console.log('Mongodb closed.'))
    .on('open', () => console.log('Mongodb connected.'))
}


app
  .use(errorMiddleware())
  .use(corsMiddlware())
  .use(router.routes())
  .listen(CONFIGS.NODE_ENV_PRODUCTION ? 80 : 8888)


if (CONFIGS.NODE_ENV_DEVELOPMENT) console.log('Server started.')
