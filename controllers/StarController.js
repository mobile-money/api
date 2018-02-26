const moment = require('moment')
const BaseController = require('./BaseController')
const { ArtModel, StarModel, SettingModel, UserModel, NoticeModel } = require('../models')


class StarController extends BaseController {

  /**
   * 获取用户收藏列表
   */
  async getUserStars ({ userId, page, limit, end }) {
    const endDate = moment(end).toDate()
    const stars = await StarModel.paginate(
      { user: userId, createdAt: { $lt: endDate } },
      { page, limit, sort: { createdAt: -1 }, populate: { path: 'art', populate: 'user' } }
    )

    stars.docs = stars.docs.map(star => {
      const art = star.art

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

    this.ctx.body = stars
  }


  /**
   * 获取收藏此作品的用户
   */
  async getArtStarredUsers ({ artId, page, limit, end }) {
    const endDate = moment(end).toDate()
    const users = await StarModel.paginate(
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
   * 收藏
   * 1. 查询 ArtModel
   * 2. 作品必须审核通过，且不能为禁用状态
   * 3. 不能重复收藏
   * 4. 作品的 starredCount +1
   * 5. 用户的 starsCount +1
   * 6. 发布此作品的用户产生通知
   */
  async star ({ artId }) {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    const art = await ArtModel.findById(artId).populate('user')
    if (!art) return this.error(404, 'The works is not found')
    if (art.status !== 'passed') return this.error(403, 'The works is not passed')
    if (art.disabled) return this.error(403, 'The works is disabled')

    const starred = await StarModel.findOne({ user: userId, art: artId })
    if (starred) return this.error(403, 'Starred')

    const star = new StarModel({ user: userId, art: artId })

    art.starredCount += 1
    user.starsCount += 1

    const publishedUserId = art.user.id
    const publishedUserSettings = await SettingModel.findOne({ user: publishedUserId })

    if (publishedUserSettings.notice.starred) {
      const notice = new NoticeModel({
        user: publishedUserId,
        type: 'starred',
        relatedUser: userId,
        relatedArt: artId,
      })
      await notice.save()
    }

    await star.save()
    await art.save()
    await user.save()

    this.ctx.status = 200
  }


  /**
   * 取消收藏
   * 1. 如果作品没有被删除，则 starredCount -1
   * 2. 用户的 starsCount -1
   */
  async unstar ({ starId }) {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    const star = await StarModel.findOne({ user: userId, _id: starId }).populate('art')
    if (!star) return this.error(404, 'The star data is not found')

    user.starsCount -= 1

    if (star.art) {
      const artId = star.art.id
      const art = await ArtModel.findById(artId)

      art.starredCount -= 1
      await art.save()
    }

    await user.save()
    await star.remove()

    this.ctx.status = 200
  }
}


module.exports = StarController
