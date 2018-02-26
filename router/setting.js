const { CustomJoi } = require('../services')
const { SettingController } = require('../controllers')


const routes = [
  {
    path: '/settings',
    method: 'GET',
    controller: SettingController,
    property: 'getSettings',
    auth: true,
  },

  {
    path: '/settings',
    method: 'PUT',
    controller: SettingController,
    property: 'updateSettings',
    auth: true,
    verified: true,
    body: true,
    schema: {
      body: {
        notice: CustomJoi.noticeSettings().optional(),
      },
    },
  },
]


module.exports = routes
