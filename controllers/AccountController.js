const _ = require('lodash')
const moment = require('moment')
const BaseController = require('./BaseController')

const { getCode, encryptPassword } = require('../libs')
const { EmailService, JWTService } = require('../services')
const { UserModel, SettingModel, UnverifyModel, LostModel } = require('../models')
const { COLORS, ADDRESS_WEB, VALIDATE_USER_ACCOUNT, VALIDATE_USER_EMAIL } = require('../configs')


class AccountController extends BaseController {

  /**
   * 注册
   * 1. 检查 account, username, email 是否被占用
   * 2. 给用户生成一个随机签名
   * 3. 密码加密
   * 4. 创建 UserModel 数据
   * 5. 创建 SettingModel 数据
   * 6. 创建 UnverifyModel 数据
   * 7. 保存数据
   * 8. 发送验证邮箱的邮件
   * 9. 生成 JWT token 并返回
   */
  async register ({ account, username, email, password }) {
    const accountRe = new RegExp(`^${_.escapeRegExp(account)}$`, 'i')
    const usernameRe = new RegExp(`^${_.escapeRegExp(username)}$`, 'i')

    const existance = await UserModel.findOne({
      $or: [{ account: accountRe }, { username: usernameRe }, { email }],
    })

    if (existance) {
      if (accountRe.test(existance.account)) return this.error(400, 'The account had been occupied')
      if (usernameRe.test(existance.username)) return this.error(400, 'The username had been occupied')
      if (email === existance.email) return this.error(400, 'The email had been occupied')
    }

    const signature = getCode()
    const encryptedPassword = encryptPassword(password, signature)
    const color = _.sample(COLORS)

    const user = new UserModel({ account, username, signature, email, color, password: encryptedPassword })
    const userId = user.id
    const setting = new SettingModel({ user: userId })
    const unverifyCode = getCode()
    const unverify = new UnverifyModel({ user: userId, code: unverifyCode })

    await user.save()
    await setting.save()
    await unverify.save()

    await EmailService.sendEmail({ type: 'register', to: email, userId, code: unverifyCode })

    this.ctx.body = JWTService.sign({ id: userId })
  }


  /**
   * 邮箱验证
   * 1. 查询 UnverifyModel，并判断时间是否过期
   * 2. 匹配 code
   * 3. 修改 UserModel 中的 verified 和 unsuppressible 为 true
   * 4. 删除 UnverifyModel 中的这条数据
   * 5. 生成 JWT token 并重定向
   */
  async verifyEmail ({ userId, code }) {
    const user = await UserModel.findById(userId)
    if (!user) return this.error(400, 'The user is not found')

    let expired = false
    const unverify = await UnverifyModel.findOne({ user: userId })

    if (unverify) {
      const now = Date.now()
      const expiredAt = +moment(unverify.createdAt).add(1, 'hour')
      if (now > expiredAt) expired = true
    } else {
      expired = true
    }

    if (expired) return this.ctx.redirect(`${ADDRESS_WEB}/feedback/verifyEmailExpired?userId=${userId}&code=${code}`)
    if (unverify.code !== code) return this.error(400, 'The code is not matched')

    user.verified = true
    user.unsuppressible = true

    await user.save()
    await unverify.remove()

    const token = JWTService.sign({ id: userId })

    this.ctx.redirect(`${ADDRESS_WEB}/feedback/verifyEmailSuccess?token=${token}`)
  }


  /**
   * 登录
   * 1. 查询 UserModel
   * 2. 如果被禁用则不能登录
   * 3. 密码匹配
   * 4. 更新 updatedAt
   * 5. 生成 JWT token 并返回
   */
  async login ({ loginName, password }) {
    let user

    if (VALIDATE_USER_ACCOUNT(loginName)) {
      const accountRe = new RegExp(`^${_.escapeRegExp(loginName)}$`, 'i')
      user = await UserModel.findOne({ account: accountRe })
    } else if (VALIDATE_USER_EMAIL(loginName)) {
      user = await UserModel.findOne({ email: loginName })
    }

    if (!user) return this.error(404, 'The user is not found')
    if (user.disabled) return this.error(403, 'The user is disabled')

    const encryptedPassword = encryptPassword(password, user.signature)
    if (encryptedPassword !== user.password) return this.error(401, 'The password is not matched')

    user.updatedAt = Date.now()
    await user.save()

    this.ctx.body = JWTService.sign({ id: user.id })
  }


  /**
   * 找回密码 - 发送邮件
   * 1. 查询 UserModel
   * 2. 用户不能被禁用
   * 3. 查询 LostModel
   * 4. 发送邮件
   */
  async sendLostEmail ({ email }) {
    const user = await UserModel.findOne({ email })

    if (!user) return this.error(404, 'The user is not found')
    if (user.disabled) return this.error(403, 'The user is disabled')

    let lost = await LostModel.findOne({ user: user.id })

    if (lost) {
      const now = Date.now()
      const expiredAt = +moment(lost.createdAt).add(1, 'hour')

      if (now < expiredAt) {
        return this.error(409, 'The code is not expired')
      } else {
        lost.code = getCode()
        lost.createdAt = Date.now()
      }

    } else {
      lost = new LostModel({ user: user.id, code: getCode() })
    }

    await lost.save()
    await EmailService.sendEmail({ type: 'lost', to: email, userId: lost.user, code: lost.code })

    this.ctx.status = 200
  }


  /**
   * 找回密码 - 修改密码
   * 1. 查询 LostModel
   * 2. 判断时间是否过期
   * 3. 匹配 code
   * 4. 查询 UserModel
   * 5. 密码加密
   * 6. 删除 LostUser 中的这条数据
   * 7. 保存数据
   */
  async changeLostPassword ({ userId, code, password }) {
    const lost = await LostModel.findOne({ user: userId })
    if (!lost) return this.error(404, 'The lost user is not found')

    const now = Date.now()
    const expiredAt = moment(lost.createdAt).add(1, 'hour').valueOf()

    if (now > expiredAt) return this.error(410, 'The code is expired')
    if (code !== lost.code) return this.error(400, 'The code is not matched')

    const user = await UserModel.findById(userId)
    if (!user) return this.error(404, 'The user is not found')

    const encryptedPassword = encryptPassword(password, user.signature)
    user.password = encryptedPassword

    await user.save()
    await lost.remove()

    this.ctx.status = 200
  }
}


module.exports = AccountController
