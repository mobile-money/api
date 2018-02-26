const moment = require('moment')
const { NoticeModel } = require('../models')
const BaseController = require('./BaseController')


class NoticeController extends BaseController {

  /**
   * 获取通知列表
   */
  async getNotices ({ classify, page, limit, end }) {
    const userId = this.ctx.state.user.id
    const endDate = moment(end).toDate()
    const query = { user: userId, createdAt: { $lt: endDate } }

    if (classify === 'unread') query.read = false

    const notices = await NoticeModel.paginate(
      query,
      { page, limit, sort: { createdAt: -1 }, populate: ['relatedUser', 'relatedArt'] }
    )

    notices.docs = notices.docs.map(doc => {
      const { type, read, content = '', createdAt, relatedUser, relatedArt } = doc
      const ret = { type, read, content, createdAt }

      if (relatedUser) {
        ret.relatedUser = {
          id: relatedUser.id,
          color: relatedUser.color,
          avatar: relatedUser.smallAvatarUrl,
          username: relatedUser.username,
        }
      }

      if (relatedArt) {
        ret.relatedArt = {
          id: relatedArt.id,
          cover: relatedArt.smallCoverUrl,
          description: relatedArt.description,
        }
      }

      return ret
    })

    this.ctx.body = notices
  }


  /**
   * 获取通知数量
   */
  async getNoticesCount ({ classify }) {
    const userId = this.ctx.state.user.id
    const query = { user: userId }

    if (classify === 'unread') query.read = false

    this.ctx.body = await NoticeModel.count(query)
  }


  /**
   * 标记所有通知为已读
   */
  async markAllNoticesRead () {
    const userId = this.ctx.state.user.id

    await NoticeModel.update({ user: userId, read: false }, { read: true })

    this.ctx.status = 200
  }


  /**
   * 标记某一条通知为已读
   */
  async markNoticeRead ({ noticeId }) {
    const userId = this.ctx.state.user.id
    const notice = await NoticeModel.findOne({ user: userId, _id: noticeId })

    if (!notice) return this.error(404, 'The notice is not found')

    notice.read = true
    await notice.save()

    this.ctx.status = 200
  }


  /**
   * 删除通知
   */
  async deleteNotice ({ noticeId }) {
    const userId = this.ctx.state.user.id
    const notice = await NoticeModel.findOne({ user: userId, _id: noticeId })

    if (!notice) return this.error(404, 'The notice is not found')

    await notice.remove()

    this.ctx.status = 200
  }
}


module.exports = NoticeController
