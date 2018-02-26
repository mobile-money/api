const { CustomJoi } = require('../services')
const { CommentController } = require('../controllers')


const routes = [
  {
    path: '/art/:artId/comments',
    method: 'GET',
    controller: CommentController,
    property: 'getArtComments',
    schema: {
      params: {
        artId: CustomJoi.artId().required(),
      },
      query: {
        end: CustomJoi.end().optional(),
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
      },
    },
  },

  {
    path: '/art/:artId/comment',
    method: 'POST',
    controller: CommentController,
    property: 'createComment',
    auth: true,
    verified: true,
    body: true,
    schema: {
      params: {
        artId: CustomJoi.artId().required(),
      },
      body: {
        repliedUserId: CustomJoi.commentRepliedUserId().optional(),
        content: CustomJoi.commentContent().required(),
      },
    },
  },

  {
    path: '/art/:artId/comment/:commentId',
    method: 'DELETE',
    controller: CommentController,
    property: 'deleteComment',
    auth: true,
    verified: true,
    schema: {
      params: {
        artId: CustomJoi.artId().required(),
        commentId: CustomJoi.commentId().required(),
      },
    },
  },
]


module.exports = routes
