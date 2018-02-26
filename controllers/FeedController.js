const moment = require('moment')
const BaseController = require('./BaseController')
const { FollowModel, FeedModel } = require('../models')


class FeedController extends BaseController {

  /**
   * 获取用户动态
   */
  async getUserFeeds ({ page, limit, end }) {
    const userId = this.ctx.state.user.id
    const endDate = moment(end).toDate()

    const followings = await FollowModel.find({ follower: userId })
    const followingIds = followings.map(follow => follow.following)

    const feeds = await FeedModel.paginate(
      {
        createdAt: { $lt: endDate },
        user: { $in: followingIds },
      },
      {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
          { path: 'user' },
          { path: 'art' },
          { path: 'share', populate: { path: 'art', populate: 'user' } },
        ],
      }
    )

    feeds.docs = feeds.docs.map(doc => {
      const { user, art, share, type, createdAt } = doc

      const ret = {
        type,
        createdAt,
        user: {
          userId: user.id,
          username: user.username,
          color: user.color,
          avatar: user.smallAvatarUrl,
        },
      }

      const final = art || share.art

      if (type === 'share' && !share.art) {
        ret.art = null

      } else {
        ret.art = {
          artId: final.id,
          description: final.description,
          cover: final.largeCoverUrl,
          starredCount: final.starredCount,
          commentsCount: final.commentsCount,
          sharedCount: final.sharedCount,
          viewsCount: final.viewsCount,
        }
      }

      if (type === 'share' && share.art) {
        const user = share.art.user
        ret.publishedUser = {
          userId: user.id,
          username: user.username,
          color: user.color,
          avatar: user.smallAvatarUrl,
        }
      }

      return ret
    })

    this.ctx.body = feeds
  }
}


module.exports = FeedController
