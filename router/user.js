const { CustomJoi } = require('../services')
const { UserController } = require('../controllers')


const routes = [
  {
    path: '/users',
    method: 'GET',
    controller: UserController,
    property: 'getUsers',
    schema: {
      query: {
        classify: CustomJoi.usersClassify().optional(),
        sortBy: CustomJoi.usersSortBy().optional(),
        end: CustomJoi.end().optional(),
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
      },
    },
  },

  {
    path: '/user/existence',
    method: 'GET',
    controller: UserController,
    property: 'exist',
    schema: {
      query: {
        type: CustomJoi.userExistanceType().required(),
        value: CustomJoi.userExistanceContent().required(),
      },
    },
  },

  {
    path: '/user/:userId/profile',
    method: 'GET',
    controller: UserController,
    property: 'getUserProfile',
    auth: true,
    passthrough: true,
    schema: {
      params: {
        userId: CustomJoi.userId().required(),
      },
    },
  },

  {
    path: '/user/avatar/ticket',
    method: 'GET',
    controller: UserController,
    property: 'getAvatarTicket',
    auth: true,
    verified: true,
    schema: {
      query: {
        mime: CustomJoi.mime().required(),
        suffix: CustomJoi.suffix().optional(),
      },
    },
  },

  {
    path: '/user/avatar/callback',
    method: 'POST',
    controller: UserController,
    property: 'updateAvatarCallback',
    body: true,
    schema: {
      body: {
        token: CustomJoi.token().required(),
        path: CustomJoi.path().required(),
        width: CustomJoi.width().required(),
        height: CustomJoi.height().required(),
      },
    },
  },

  {
    path: '/user/avatar',
    method: 'DELETE',
    controller: UserController,
    property: 'deleteAvatar',
    auth: true,
    verified: true,
  },

  {
    path: '/user/background/ticket',
    method: 'GET',
    controller: UserController,
    property: 'getBackgroundTicket',
    auth: true,
    verified: true,
    schema: {
      query: {
        mime: CustomJoi.mime().required(),
        suffix: CustomJoi.suffix().optional(),
      },
    },
  },

  {
    path: '/user/background/callback',
    method: 'POST',
    controller: UserController,
    property: 'updateBackgroundCallback',
    body: true,
    schema: {
      body: {
        token: CustomJoi.token().required(),
        path: CustomJoi.path().required(),
        width: CustomJoi.width().required(),
        height: CustomJoi.height().required(),
      },
    },
  },

  {
    path: '/user/background',
    method: 'DELETE',
    controller: UserController,
    property: 'deleteBackground',
    auth: true,
    verified: true,
  },

  {
    path: '/user/profile',
    method: 'PUT',
    controller: UserController,
    property: 'updateProfile',
    auth: true,
    verified: true,
    body: true,
    schema: {
      body: {
        username: CustomJoi.username().optional(),
        country: CustomJoi.country().optional(),
        city: CustomJoi.city().optional(),
        introduction: CustomJoi.introduction().optional(),
        color: CustomJoi.color().optional(),
        links: CustomJoi.links().optional(),
        contacts: CustomJoi.contacts().optional(),
      },
    },
  },

  {
    path: '/user/password',
    method: 'PUT',
    controller: UserController,
    property: 'updatePassword',
    auth: true,
    verified: true,
    body: true,
    schema: {
      body: {
        oldPassword: CustomJoi.oldPassword().required(),
        newPassword: CustomJoi.newPassword().required(),
      },
    },
  },

  {
    path: '/user/email',
    method: 'PUT',
    controller: UserController,
    property: 'updateEmail',
    auth: true,
    verified: true,
    body: true,
    schema: {
      body: {
        email: CustomJoi.email().required(),
      },
    },
  },
]


module.exports = routes
