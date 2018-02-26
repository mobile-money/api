const moment = require('moment')
const BaseController = require('./BaseController')
const { ArtModel, ShareModel, SettingModel, UserModel, NoticeModel, FeedModel } = require('../models')


class ShareController extends BaseController {

  /**
   * 获取用户分享列表
   */
  async getUserShares ({ userId, page, limit, end }) {
    const endDate = moment(end).toDate()
    const shares = await ShareModel.paginate(
      { user: userId, createdAt: { $lt: endDate } },
      { page, limit, sort: { createdAt: -1 }, populate: { path: 'art', populate: 'user' } }
    )

    shares.docs = shares.docs.map(share => {
      const art = share.art

      if (!art) return null

      return {
        artId: art.id,
        description: art.description,
        cover: art.smallCoverUrl,
        userId: art.user.id,
        username: art.user.username,
        avatar: art.user.smallAvatarUrl,
        color: art.user.color,
      }
    })

    this.ctx.body = shares
  }


  /**
   * 获取分享此作品的用户
   */
  async getArtSharedUsers ({ artId, page, limit, end }) {
    const endDate = moment(end).toDate()
    const users = await ShareModel.paginate(
      { art: artId, createdAt: { $lt: endDate } },
      { page, limit, sort: { createdAt: -1 }, populate: 'user' }
    )

    users.docs = users.docs.map(doc => {
      const user = doc.user

      return {
        id: user.id,
        color: user.color,
        username: user.username,
        avatar: user.mediumAvatarUrl,
      }
    })

    this.ctx.body = users
  }


  /**
   * 分享
   * 1. 查询 ArtModel
   * 2. 作品必须审核通过，且不能为禁用状态
   * 3. 作品的 sharedCount +1
   * 4. 用户的 sharesCount +1
   * 5. 产生动态
   * 6. 发布此作品的用户产生通知
   */
  async share ({ artId }) {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    const art = await ArtModel.findById(artId).populate('user')
    if (!art) return this.error(404, 'The works is not found')
    if (art.status !== 'passed') return this.error(403, 'The works is not passed')
    if (art.disabled) return this.error(403, 'The works is disabled')

    const share = new ShareModel({ user: userId, art: artId })

    art.sharedCount += 1
    user.sharesCount += 1

    const feed = new FeedModel({ type: 'share', user: userId, share: share.id })

    const publishedUserId = art.user.id
    const publishedUserSettings = await SettingModel.findOne({ user: publishedUserId })

    if (publishedUserSettings.notice.shared) {
      const notice = new NoticeModel({
        user: publishedUserId,
        type: 'shared',
        relatedUser: userId,
        relatedArt: artId,
      })
      await notice.save()
    }

    await share.save()
    await art.save()
    await user.save()
    await feed.save()

    this.ctx.status = 200
  }


  /**
   * 删除分享
   * 1. 如果作品没有被删除，则 sharedCount -1
   * 2. 用户的 sharesCount -1
   * 3. 删除动态
   */
  async deleteShare ({ shareId }) {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    const share = await ShareModel.findOne({ user: userId, _id: shareId }).populate('art')
    if (!share) return this.error(404, 'The share data is not found')

    user.sharesCount -= 1

    if (share.art) {
      const artId = share.art.id
      const art = await ArtModel.findById(artId)

      art.sharedCount -= 1
      await art.save()
    }

    const feed = await FeedModel.findOne({ user: userId, share: shareId })
    if (feed) await feed.remove()

    await user.save()
    await share.remove()

    this.ctx.status = 200
  }
}


module.exports = ShareController
