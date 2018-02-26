const { CustomJoi } = require('../services')
const { ShareController } = require('../controllers')


const routes = [
  {
    path: '/user/:userId/shares',
    method: 'GET',
    controller: ShareController,
    property: 'getUserShares',
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
    path: '/art/:artId/sharedUsers',
    method: 'GET',
    controller: ShareController,
    property: 'getArtSharedUsers',
    schema: {
      params: {
        artId: CustomJoi.artId().required(),
      },
      query: {
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
        end: CustomJoi.end().optional(),
      },
    },
  },

  {
    path: '/share',
    method: 'POST',
    controller: ShareController,
    property: 'share',
    auth: true,
    verified: true,
    body: true,
    schema: {
      body: {
        artId: CustomJoi.artId().required(),
      },
    },
  },

  {
    path: '/share/:shareId',
    method: 'DELETE',
    controller: ShareController,
    property: 'deleteShare',
    auth: true,
    verified: true,
    schema: {
      params: {
        shareId: CustomJoi.shareId().required(),
      },
    },
  },
]


module.exports = routes
