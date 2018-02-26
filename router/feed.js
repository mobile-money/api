const { CustomJoi } = require('../services')
const { FeedController } = require('../controllers')


const routes = [
  {
    path: '/feeds',
    method: 'GET',
    controller: FeedController,
    property: 'getUserFeeds',
    auth: true,
    schema: {
      query: {
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
        end: CustomJoi.end().optional(),
      },
    },
  },
]


module.exports = routes
