const { CustomJoi } = require('../services')
const { StarController } = require('../controllers')


const routes = [
  {
    path: '/user/:userId/stars',
    method: 'GET',
    controller: StarController,
    property: 'getUserStars',
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
    path: '/art/:artId/starredUsers',
    method: 'GET',
    controller: StarController,
    property: 'getArtStarredUsers',
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
    path: '/star',
    method: 'POST',
    controller: StarController,
    property: 'star',
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
    path: '/star/:starId',
    method: 'DELETE',
    controller: StarController,
    property: 'unstar',
    auth: true,
    verified: true,
    schema: {
      params: {
        starId: CustomJoi.starId().required(),
      },
    },
  },
]


module.exports = routes
