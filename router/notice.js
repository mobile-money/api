const { CustomJoi } = require('../services')
const { NoticeController } = require('../controllers')


const routes = [
  {
    path: '/notices',
    method: 'GET',
    controller: NoticeController,
    property: 'getNotices',
    auth: true,
    schema: {
      query: {
        classify: CustomJoi.noticeClassify().optional(),
        end: CustomJoi.end().optional(),
        page: CustomJoi.page().optional(),
        limit: CustomJoi.limit().optional(),
      },
    },
  },

  {
    path: '/notices/count',
    method: 'GET',
    controller: NoticeController,
    property: 'getNoticesCount',
    auth: true,
    schema: {
      query: {
        classify: CustomJoi.noticeClassify().optional(),
      },
    },
  },

  {
    path: '/notices',
    method: 'PUT',
    controller: NoticeController,
    property: 'markAllNoticesRead',
    auth: true,
    verified: true,
  },

  {
    path: '/notice/:noticeId',
    method: 'PUT',
    controller: NoticeController,
    property: 'markNoticeRead',
    auth: true,
    verified: true,
    schema: {
      params: {
        noticeId: CustomJoi.noticeId().required(),
      },
    },
  },

  {
    path: '/notice/:noticeId',
    method: 'DELETE',
    controller: NoticeController,
    property: 'deleteNotice',
    auth: true,
    verified: true,
    schema: {
      params: {
        noticeId: CustomJoi.noticeId().required(),
      },
    },
  },
]


module.exports = routes
