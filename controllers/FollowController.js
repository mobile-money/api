const moment = require('moment')
const BaseController = require('./BaseController')
const { FollowModel, UserModel, SettingModel, NoticeModel } = require('../models')


class FollowerController extends BaseController {

  /**
   * 获取用户关注列表
   */
  async getUserFollowings ({ userId, page, limit, end }) {
    const endDate = moment(end).toDate()
    const followings = await FollowModel.paginate(
      { follower: userId, createdAt: { $lt: endDate } },
      { page, limit, sort: { createdAt: -1 }, populate: 'following' }
    )

    followings.docs = followings.docs.map(doc => {
      const { following: f } = doc
      return {
        id: f.id,
        color: f.color,
        disabled: f.disabled,
        username: f.username,
        artsCount: f.artsCount,
        avatar: f.mediumAvatarUrl,
        background: f.smallBackgroundUrl,
        followersCount: f.followersCount,
        followingsCount: f.followingsCount,
      }
    })

    this.ctx.body = followings
  }


  /**
   * 获取用户粉丝列表
   */
  async getUserFollowers ({ userId, page, limit, end }) {
    const endDate = moment(end).toDate()
    const followers = await FollowModel.paginate(
      { following: userId, createdAt: { $lt: endDate } },
      { page, limit, sort: { createdAt: -1 }, populate: 'follower' }
    )

    followers.docs = followers.docs.map(doc => {
      const { follower: f } = doc
      return {
        id: f.id,
        color: f.color,
        disabled: f.disabled,
        username: f.username,
        artsCount: f.artsCount,
        avatar: f.mediumAvatarUrl,
        background: f.smallBackgroundUrl,
        followersCount: f.followersCount,
        followingsCount: f.followingsCount,
      }
    })

    this.ctx.body = followers
  }


  /**
   * 关注
   * 1. 不能重复关注
   * 2. 被关注的用户不能为禁用状态
   * 3. Follower 的关注数据 +1，Following 的粉丝数据 +1
   * 4. 被关注的用户产生通知
   */
  async follow ({ userId: followingId }) {
    const followerId = this.ctx.state.user.id

    const followed = await FollowModel.findOne({ follower: followerId, following: followingId })
    if (followed) return this.error(403, 'Can\'t follow again')

    const follower = await UserModel.findById(followerId)
    const following = await UserModel.findById(followingId)

    if (!follower) return this.error(404, 'The follower is not found')
    if (!following) return this.error(404, 'The user you will follow is not found')
    if (following.disabled) return this.error(404, 'The user you will follow is disabled')

    follower.followingsCount += 1
    following.followersCount += 1

    const followerFollow = new FollowModel({ follower: followerId, following: followingId })

    await follower.save()
    await following.save()
    await followerFollow.save()

    const followingSettings = await SettingModel.findOne({ user: followingId })
    if (followingSettings.notice.followed) {
      const notice = new NoticeModel({ user: followingId, type: 'followed', relatedUser: followerId })
      await notice.save()
    }

    this.ctx.status = 200
  }


  /**
   * 取消关注
   * 1. Follower 的关注数据 -1，Following 的粉丝数据 -1
   */
  async unfollow ({ userId: followingId }) {
    const followerId = this.ctx.state.user.id

    const followerFollow = await FollowModel.findOne({ follower: followerId, following: followingId })
    if (!followerFollow) return this.error(404, 'The follow data is not found')

    const follower = await UserModel.findById(followerId)
    const following = await UserModel.findById(followingId)

    if (!follower) return this.error(404, 'The follower is not found')
    if (!following) return this.error(404, 'The followed user is not found')

    follower.followingsCount -= 1
    following.followersCount -= 1

    await follower.save()
    await following.save()
    await followerFollow.remove()

    this.ctx.status = 200
  }
}


module.exports = FollowerController
