const { CustomJoi } = require('../services')
const { ArtController } = require('../controllers')


const routes = [
  {
    path: '/arts',
    method: 'GET',
    controller: ArtController,
    property: 'getArts',
    schema: {
      query: {
        classify: CustomJoi.artsClassify().optional(),
        sortBy: CustomJoi.artsSortBy().optional(),
        end: CustomJoi.end().optional(),
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
      },
    },
  },

  {
    path: '/user/:userId/arts',
    method: 'GET',
    controller: ArtController,
    property: 'getUserArts',
    auth: true,
    passthrough: true,
    schema: {
      params: {
        userId: CustomJoi.userId().required(),
      },
      query: {
        status: CustomJoi.userArtsStatus().optional(),
        categoryId: CustomJoi.categoryId().optional(),
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
        end: CustomJoi.end().optional(),
      },
    },
  },

  {
    path: '/art/:artId/detail',
    method: 'GET',
    controller: ArtController,
    property: 'getArtDetail',
    auth: true,
    passthrough: true,
    schema: {
      params: {
        artId: CustomJoi.artId().required(),
      },
    },
  },

  {
    path: '/art',
    method: 'POST',
    controller: ArtController,
    property: 'createArt',
    auth: true,
    verified: true,
    body: true,
    schema: {
      body: {
        description: CustomJoi.artDescription().optional(),
        categoryId: CustomJoi.categoryId().optional(),
        images: CustomJoi.artImages().required(),
      },
    },
  },

  {
    path: '/art/callback',
    method: 'POST',
    controller: ArtController,
    property: 'createArtCallback',
    body: true,
    schema: {
      body: {
        token: CustomJoi.token().required(),
        path: CustomJoi.path().required(),
        artId: CustomJoi.artId().required(),
        cover: CustomJoi.cover().optional(),
        order: CustomJoi.artCallbackOrder().required(),
        mime: CustomJoi.mime().required(),
        width: CustomJoi.width().required(),
        height: CustomJoi.height().required(),
        size: CustomJoi.size().required(),
      },
    },
  },

  {
    path: '/art/:artId',
    method: 'DELETE',
    controller: ArtController,
    property: 'deleteArt',
    auth: true,
    verified: true,
    schema: {
      params: {
        artId: CustomJoi.artId().required(),
      },
    },
  },
]


module.exports = routes
