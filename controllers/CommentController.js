const moment = require('moment')
const BaseController = require('./BaseController')
const { ArtModel, UserModel, CommentModel, SettingModel, NoticeModel } = require('../models')


class CommentController extends BaseController {

  /**
   * 获取作品评论
   */
  async getArtComments ({ artId, page, limit, end }) {
    const endDate = moment(end).toDate()
    const comments = await CommentModel.paginate(
      { art: artId, createdAt: { $lt: endDate } },
      { page, limit, sort: { createdAt: -1 }, populate: ['commentUser', 'repliedUser'] }
    )

    comments.docs = comments.docs.map(comment => {
      const ret = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        commentUser: {
          id: comment.commentUser.id,
          username: comment.commentUser.username,
          avatar: comment.commentUser.smallAvatarUrl,
          color: comment.commentUser.color,
        },
      }

      if (comment.repliedUser) {
        ret.repliedUser = {
          id: comment.repliedUser.id,
          username: comment.repliedUser.username,
        }
      }

      return ret
    })

    this.ctx.body = comments
  }


  /**
   * 评论
   * 1. 查询 ArtModel
   * 2. 作品必须通过审核，且不能被禁用
   * 3. 如果 repliedUser 不为空，则它必须存在于 UserModel 中
   * 4. ArtModel 中的 commentsCount +1
   * 5. 如果 repliedUser 为空，则 art.user 产生通知
   * 6. 如果 repliedUser 不为空，则 repliedUser产生通知
   */
  async createComment ({ artId, repliedUserId, content }) {
    const commentUserId = this.ctx.state.user.id
    const art = await ArtModel.findById(artId).populate('user')
    if (!art) return this.error(404, 'The works is not found')

    if (art.status !== 'passed') return this.error(403, 'The works is not passed')
    if (art.disabled) return this.error(403, 'The works is disabled')

    art.commentsCount += 1

    const comment = new CommentModel({ art: artId, commentUser: commentUserId, content })

    if (repliedUserId) {
      const repliedUser = await UserModel.findById(repliedUserId)

      if (!repliedUser) return this.error(404, 'The replied user is not found')

      comment.repliedUser = repliedUserId

      const repliedUserSettings = await SettingModel.findOne({ user: repliedUserId })

      if (repliedUserSettings.notice.commented) {
        const notice = new NoticeModel({
          user: repliedUserId,
          type: 'replied',
          relatedUser: commentUserId,
          relatedArt: artId,
          content: content,
        })
        await notice.save()
      }

    } else {
      const commentedUserId = art.user.id
      const commentedUserSettings = await SettingModel.findOne({ user: commentedUserId })

      if (commentedUserSettings.notice.commented) {
        const notice = new NoticeModel({
          user: commentedUserId,
          type: 'commented',
          relatedUser: commentUserId,
          relatedArt: artId,
          content: content,
        })
        await notice.save()
      }
    }

    await comment.save()
    await art.save()

    this.ctx.status = 200
  }


  /**
   * 删除评论
   * 1. 查询 ArtModel
   * 2. 查询 CommentModel
   * 3. ArtModel 中的 commentsCount -1
   */
  async deleteComment ({ artId, commentId }) {
    const art = await ArtModel.findById(artId)
    if (!art) return this.error(404, 'The works are not found')

    const userId = this.ctx.state.user.id
    const comment = await CommentModel.findOne({ art: artId, commentUser: userId, _id: commentId })
    if (!comment) return this.error(404, 'The comment is not found')

    art.commentsCount -= 1

    await comment.remove()
    await art.save()

    this.ctx.status = 200
  }
}


module.exports = CommentController
