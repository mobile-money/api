const _ = require('lodash')
const moment = require('moment')
const jsonwebtoken = require('jsonwebtoken')

const BaseController = require('./BaseController')
const { encryptPassword, getCode } = require('../libs')
const { UserModel, UnverifyModel } = require('../models')
const { OSSService, EmailService } = require('../services')


class UserController extends BaseController {

  /**
   * 获取用户列表
   */
  async getUsers ({ classify, sortBy, end, page, limit }) {
    let users

    if (classify === 'all') {
      let endDate = moment(end).toDate()
      let sort = { createdAt: -1 }

      if (sortBy === 'arts') sort = { artsCount: -1 }
      if (sortBy === 'followers') sort = { followersCount: -1 }

      users = await UserModel.paginate(
        { createdAt: { $lt: endDate }, disabled: false },
        { page, limit, sort }
      )

      users.docs = users.docs.map(user => {
        return {
          id: user.id,
          color: user.color,
          username: user.username,
          artsCount: user.artsCount,
          avatar: user.mediumAvatarUrl,
          background: user.smallBackgroundUrl,
          followersCount: user.followersCount,
          followingsCount: user.followingsCount,
        }
      })
    }

    this.ctx.body = users
  }


  /**
   * 判断用户是否存在
   */
  async exist ({ type, value }) {
    let user

    if (type === 'account') {
      const accountRe = new RegExp(`^${_.escapeRegExp(value)}$`, 'i')
      user = await UserModel.findOne({ account: accountRe })

    } else if (type === 'username') {
      const usernameRe = new RegExp(`^${_.escapeRegExp(value)}$`, 'i')
      user = await UserModel.findOne({ username: usernameRe })

    } else if (type === 'email') {
      user = await UserModel.findOne({ email: value })
    }

    this.ctx.body = !!user
  }


  /**
   * 获取用户基本信息
   */
  async getUserProfile ({ userId }) {
    let exact = false

    if (this.ctx.state.user) {
      exact = this.ctx.state.user.id === userId
    }

    const user = await UserModel.findById(userId)
    if (!user) return this.error(404, 'The user is not found')

    const ret = {
      account: user.account,
      username: user.username,
      verified: user.verified,
      disabled: user.disabled,
      color: user.color,
      avatar: user.mediumAvatarUrl,
      background: user.largeBackgroundUrl,
      country: user.country,
      city: user.city,
      introduction: user.introduction,
      links: user.links.map(link => ({ name: link.name, content: link.content })),
      contacts: user.contacts.map(contact => ({ name: contact.name, content: contact.content })),
      artsCount: user.artsCount,
      followingsCount: user.followingsCount,
      followersCount: user.followersCount,
      starsCount: user.starsCount,
      sharesCount: user.sharesCount,
    }

    if (exact) ret.email = user.email

    this.ctx.body = ret
  }


  /**
   * 更新用户基本信息
   */
  async updateProfile ({ username, country, city, introduction, color, links, contacts }) {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    if (username) {
      const usernameRe = new RegExp(`^${_.escapeRegExp(username)}$`, 'i')
      const existance = await UserModel.findOne({ username: usernameRe })

      if (existance && !usernameRe.test(existance.username)) return this.error(400, 'The username had been occupied')

      user.username = username
    }

    if (country != null) user.country = country
    if (city != null) user.city = city
    if (introduction != null) user.introduction = introduction
    if (color) user.color = color
    if (links) user.links = links
    if (contacts) user.contacts = contacts

    await user.save()

    this.ctx.status = 200
  }


  /**
   * 获取上传头像 Ticket
   */
  async getAvatarTicket ({ mime, suffix }) {
    const token = this.ctx.header['authorization'].split(' ')[1]
    const body = { token, path: '${object}', width: '${imageInfo.width}', height: '${imageInfo.height}' } // eslint-disable-line no-template-curly-in-string

    this.ctx.body = OSSService.getTicket('avatar', suffix, body)
  }


  /**
   * 更新头像的回调函数
   */
  async updateAvatarCallback ({ token, path, width, height }) {
    const { id: userId } = jsonwebtoken.decode(token)
    const user = await UserModel.findById(userId)

    if (!user) return this.error(404, 'The user is not found')
    if (user.disabled) return this.error(403, 'The user is disabled')
    if (!user.verified) return this.error(403, 'The user\'s email is unverified')

    if (user.avatar && user.avatar.path) {
      await OSSService.deleteObject(user.avatar.path)
    }

    user.avatar = { path, width, height }
    await user.save()

    this.ctx.body = user.mediumAvatarUrl
  }


  /**
   * 删除头像
   */
  async deleteAvatar () {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    if (user.avatar && user.avatar.path) {
      await OSSService.deleteObject(user.avatar.path)
    }

    this.ctx.status = 200
  }


  /**
   * 获取上传背景 Ticket
   */
  async getBackgroundTicket ({ mime, suffix }) {
    const token = this.ctx.header['authorization'].split(' ')[1]
    const body = { token, path: '${object}', width: '${imageInfo.width}', height: '${imageInfo.height}' } // eslint-disable-line no-template-curly-in-string

    this.ctx.body = OSSService.getTicket('background', suffix, body)
  }


  /**
   * 更新背景的回调函数
   */
  async updateBackgroundCallback ({ token, path, width, height }) {
    const { id: userId } = jsonwebtoken.decode(token)
    const user = await UserModel.findById(userId)

    if (!user) return this.error(404, 'The user is not found')
    if (user.disabled) return this.error(403, 'The user is disabled')
    if (!user.verified) return this.error(403, 'The user\'s email is unverified')

    if (user.background && user.background.path) {
      await OSSService.deleteObject(user.background.path)
    }

    user.background = { path, width, height }
    await user.save()

    this.ctx.body = user.largeBackgroundUrl
  }


  /**
   * 删除背景
   */
  async deleteBackground () {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    if (user.background && user.background.path) {
      await OSSService.deleteObject(user.background.path)
    }

    this.ctx.status = 200
  }


  /**
   * 更新密码
   * 1. 旧密码匹配
   * 2. 新密码加密
   */
  async updatePassword ({ oldPassword, newPassword }) {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    const oldPasswordEncrypted = encryptPassword(oldPassword, user.signature)
    const newPasswordEncrypted = encryptPassword(newPassword, user.signature)

    if (user.password !== oldPasswordEncrypted) return this.error(403, 'Incorrect password')

    user.password = newPasswordEncrypted
    await user.save()

    this.ctx.status = 200
  }


  /**
   * 修改邮箱
   * 1. 如果新邮箱与之前的一样，则什么都不做
   * 2. 判断此邮箱在数据库中是否唯一
   * 3. 生成 UnverifyModel 数据
   * 4. 修改 UserModel 中的 email，并置 verified 为 false
   * 5. 发送邮件
   */
  async updateEmail ({ email }) {
    const userId = this.ctx.state.user.id
    const user = await UserModel.findById(userId)

    if (user.email !== email) {
      const existance = await UserModel.findOne({ email })
      if (existance) return this.error(400, 'The email had been occupied')

      const unverifyCode = getCode()
      const unverify = new UnverifyModel({ user: userId, code: unverifyCode })

      user.email = email
      user.verified = false

      await user.save()
      await unverify.save()
      await EmailService.sendEmail({ type: 'email', to: email, userId, code: unverifyCode })
    }

    this.ctx.status = 200
  }
}


module.exports = UserController
