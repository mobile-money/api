const { CustomJoi } = require('../services')
const { FollowController } = require('../controllers')


const routes = [
  {
    path: '/user/:userId/followings',
    method: 'GET',
    controller: FollowController,
    property: 'getUserFollowings',
    schema: {
      params: {
        userId: CustomJoi.userId().required(),
      },
      query: {
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
        end: CustomJoi.end().optional(),
      },
    },
  },

  {
    path: '/user/:userId/followers',
    method: 'GET',
    controller: FollowController,
    property: 'getUserFollowers',
    schema: {
      params: {
        userId: CustomJoi.userId().required(),
      },
      query: {
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
        end: CustomJoi.end().optional(),
      },
    },
  },

  {
    path: '/follow',
    method: 'POST',
    controller: FollowController,
    property: 'follow',
    auth: true,
    verified: true,
    body: true,
    schema: {
      body: {
        userId: CustomJoi.userId().required(),
      },
    },
  },

  {
    path: '/follow/:userId',
    method: 'DELETE',
    controller: FollowController,
    property: 'unfollow',
    auth: true,
    verified: true,
    schema: {
      params: {
        userId: CustomJoi.userId().required(),
      },
    },
  },
]


module.exports = routes
