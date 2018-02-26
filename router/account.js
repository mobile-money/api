const { CustomJoi } = require('../services')
const { AccountController } = require('../controllers')


const routes = [
  {
    path: '/register',
    method: 'POST',
    controller: AccountController,
    property: 'register',
    body: true,
    schema: {
      body: {
        account: CustomJoi.account().required(),
        username: CustomJoi.username().required(),
        email: CustomJoi.email().required(),
        password: CustomJoi.password().required(),
      },
    },
  },

  {
    path: '/verification',
    method: 'GET',
    controller: AccountController,
    property: 'verifyEmail',
    schema: {
      query: {
        userId: CustomJoi.userId().required(),
        code: CustomJoi.code().required(),
      },
    },
  },

  {
    path: '/login',
    method: 'POST',
    controller: AccountController,
    property: 'login',
    body: true,
    schema: {
      body: {
        loginName: CustomJoi.loginName().required(),
        password: CustomJoi.password().required(),
      },
    },
  },

  {
    path: '/lost',
    method: 'POST',
    controller: AccountController,
    property: 'sendLostEmail',
    body: true,
    schema: {
      body: {
        email: CustomJoi.email().required(),
      },
    },
  },

  {
    path: '/lost',
    method: 'PUT',
    controller: AccountController,
    property: 'changeLostPassword',
    body: true,
    schema: {
      body: {
        userId: CustomJoi.userId().required(),
        code: CustomJoi.code().required(),
        password: CustomJoi.password().required(),
      },
    },
  },
]


module.exports = routes
