const moment = require('moment')
const jsonwebtoken = require('jsonwebtoken')

const { OSSService } = require('../services')
const BaseController = require('./BaseController')
const { ArtModel, CategoryModel, UserModel, CommentModel, FeedModel } = require('../models')


class ArtController extends BaseController {

  /**
   * 获取作品列表
   * 1. 没有通过审核和被禁用的作品不返回
   */
  async getArts ({ classify, sortBy, end, page, limit }) {
    let endDate = moment(end).toDate()
    let query = { createdAt: { $lt: endDate }, disabled: false, status: 'passed' }
    let sort = { createdAt: -1 }

    if (classify === 'recommended') query.recommended = true
    if (sortBy === 'starred') sort = { starredCount: -1 }
    if (sortBy === 'shared') sort = { sharedCount: -1 }

    const options = { page, limit, sort, populate: 'user' }
    const arts = await ArtModel.paginate(query, options)

    arts.docs = arts.docs.map(art => {
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

    this.ctx.body = arts
  }


  /**
   * 获取用户的作品列表
   * 1. 如果发起请求的用户 ID 与 userId 不符，则不能返回没有通过审核和被禁用的作品
   */
  async getUserArts ({ userId, status, categoryId, page, limit, end }) {
    const user = await UserModel.findById(userId)
    if (!user) return this.error(404, 'The user is not found')

    const exact = this.ctx.state.user && this.ctx.state.user.id === userId

    if (status !== 'all' && status !== 'passed' && !exact) return this.error(403)
    if (!status || status === 'all') status = 'passed'

    const endDate = moment(end).toDate()
    const query = { createdAt: { $lt: endDate }, status }

    if (!exact) query.disabled = false

    if (categoryId) {
      const existance = await CategoryModel.findOne({ user: userId, 'categories._id': categoryId })
      if (!existance) return this.error(404, 'The category is not found')
      query.categoryId = categoryId
    }

    const arts = await ArtModel.paginate(query, { page, limit, sort: { createdAt: -1 } })

    arts.docs = arts.docs.map(art => {
      const ret = {
        artId: art.id,
        cover: art.smallCoverUrl,
        description: art.description,
        userId: user.id,
        username: user.username,
        avatar: user.smallAvatarUrl,
        color: user.color,
      }

      if (exact) {
        ret.disabled = art.disabled
        ret.status = art.status
        ret.categoryId = art.categoryId

        if (art.failedReason) ret.failedReason = art.failedReason
      }

      return ret
    })

    this.ctx.body = arts
  }


  /**
   * 获取作品详情
   * 1. 查询 ArtModel
   * 2. 如果发布此作品的用户不是当前登录的用户，则此作品的 status 必须是 passed，且不能为 disabled，才返回数据，且浏览数据 +1
   * 3. 如果发布此作品的用户是当前登录的用户，且 failedReason 有数据，则返回
   */
  async getArtDetail ({ artId }) {
    const art = await ArtModel.findById(artId).populate('user')
    let exact = false

    if (!art) return this.error(404, 'The works is not found')
    if (this.ctx.state.user) exact = this.ctx.state.user.id === art.user.id

    if (!exact) {
      if (art.status !== 'passed') return this.error(403)
      if (art.disabled) return this.error(403, 'The works is disabled')
    }

    const ret = {
      artId: art.id,
      description: art.description,
      thumbnails: art.thumbnailUrls,
      images: art.imageUrls,
      viewsCount: art.viewsCount,
      commentsCount: art.commentsCount,
      starredCount: art.starredCount,
      sharedCount: art.sharedCount,
      status: art.status,
      recommended: art.recommended,
      disabled: art.disabled,
      createdAt: art.createdAt,
      userId: art.user.id,
      username: art.user.username,
      avatar: art.user.smallAvatarUrl,
      color: art.user.color,
    }

    if (exact) {
      if (art.failedReason) ret.failedReason = art.failedReason
    } else {
      art.viewsCount += 1
      await art.save()
    }

    this.ctx.body = ret
  }


  /**
   * 发布作品
   * 1. 如果 categoryId 存在，检查是否是此用户的
   * 2. 生成 ArtModel 数据
   * 3. 生成上传文件凭证
   */
  async createArt ({ description, categoryId, images }) {
    const userId = this.ctx.state.user.id

    if (categoryId) {
      const existance = await CategoryModel.findOne({ user: userId, 'categories._id': categoryId })
      if (!existance) return this.error(404, 'The category is not found')
    }

    const art = new ArtModel({ user: userId, description, status: 'inspecting' })
    const token = this.ctx.header['authorization'].split(' ')[1]

    const tickets = images.map((image, index) => {
      const { suffix, cover = false } = image
      const body = {
        token,
        artId: art.id,
        cover,
        order: index,
        path: '${object}', // eslint-disable-line no-template-curly-in-string
        mime: '${mimeType}', // eslint-disable-line no-template-curly-in-string
        width: '${imageInfo.width}', // eslint-disable-line no-template-curly-in-string
        height: '${imageInfo.height}', // eslint-disable-line no-template-curly-in-string
        size: '${size}', // eslint-disable-line no-template-curly-in-string
      }
      return OSSService.getTicket('art', suffix, body)
    })

    await art.save()

    this.ctx.body = tickets
  }


  /**
   * 发布作品的回调函数
   * 1. Decode token
   * 2. 用户验证
   * 3. 查询 ArtModel
   * 4. 统计用户已使用空间
   */
  async createArtCallback ({ token, artId, path, cover, order, mime, width, height, size }) {
    const { id: userId } = jsonwebtoken.decode(token)
    const user = await UserModel.findById(userId)

    if (!user) return this.error(404, 'The user is not found')
    if (user.disabled) return this.error(403, 'The user is disabled')
    if (!user.verified) return this.error(403, 'The user\'s email is unverified')

    const art = await ArtModel.findOne({ user: userId, _id: artId })
    if (!art) return this.error(404, 'The works is not found')

    art.images[order] = { path, mime, width, height, size, cover: cover ? void 0 : true }
    user.usedStorage += size

    await art.save()
    await user.save()

    this.ctx.body = this.ctx.state.data
  }


  /**
   * 删除作品
   * 1. 查询 ArtModel
   * 2. 重新统计用户数据
   * 3. 删除图片
   * 4. 删除此作品的评论
   * 5. 删除动态
   */
  async deleteArt ({ artId }) {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    const art = await ArtModel.findOne({ user: userId, _id: artId })
    if (!art) return this.error(404, 'The works is not found')

    let deleteStorage = 0
    let paths = []

    art.images.forEach(image => {
      deleteStorage += image.size
      paths.push(image.path)
    })

    user.usedStorage -= deleteStorage
    if (art.status === 'passed') user.artsCount -= 1

    await OSSService.deleteMultiObjects(paths)
    await art.remove()
    await user.save()
    await CommentModel.deleteMany({ art: artId })
    await FeedModel.deleteMany({ user: userId, art: artId })

    this.ctx.status = 200
  }
}


module.exports = ArtController
