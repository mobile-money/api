const { CustomJoi } = require('../services')
const { CategoryController } = require('../controllers')


const routes = [
  {
    path: '/user/:userId/categories',
    method: 'GET',
    controller: CategoryController,
    property: 'getUserCategories',
    schema: {
      params: {
        userId: CustomJoi.userId().required(),
      },
    },
  },

  {
    path: '/category',
    method: 'POST',
    controller: CategoryController,
    property: 'createCategory',
    auth: true,
    verified: true,
    body: true,
    schema: {
      body: {
        name: CustomJoi.categoryName().required(),
      },
    },
  },

  {
    path: '/category/:categoryId',
    method: 'PUT',
    controller: CategoryController,
    property: 'updateCategory',
    auth: true,
    verified: true,
    body: true,
    schema: {
      params: {
        categoryId: CustomJoi.categoryId().required(),
      },
      body: {
        name: CustomJoi.categoryName().required(),
      },
    },
  },

  {
    path: '/category/:categoryId',
    method: 'DELETE',
    controller: CategoryController,
    property: 'deleteCategory',
    auth: true,
    verified: true,
    schema: {
      params: {
        categoryId: CustomJoi.categoryId().required(),
      },
    },
  },
]


module.exports = routes
