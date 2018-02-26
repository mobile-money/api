const { SettingModel } = require('../models')
const BaseController = require('./BaseController')


class SettingController extends BaseController {

  /**
   * 获取用户设置
   */
  async getSettings () {
    const userId = this.ctx.state.user.id
    const settings = await SettingModel.findOne({ user: userId })

    if (!settings) return this.error(404, 'The user settings is not found')

    this.ctx.body = { notice: settings.notice }
  }


  /**
   * 修改用户设置
   */
  async updateSettings ({ notice }) {
    const userId = this.ctx.state.user.id
    const settings = await SettingModel.findOne({ user: userId })

    if (!settings) return this.error(404, 'The user settings is not found')

    if (notice) {
      const { followed, inspected, commented, starred, shared, recommended } = notice

      if (typeof shared === 'boolean') settings.notice.shared = shared
      if (typeof starred === 'boolean') settings.notice.starred = starred
      if (typeof followed === 'boolean') settings.notice.followed = followed
      if (typeof inspected === 'boolean') settings.notice.inspected = inspected
      if (typeof commented === 'boolean') settings.notice.commented = commented
      if (typeof recommended === 'boolean') settings.notice.recommended = recommended
    }

    await settings.save()

    this.ctx.body = { notice: settings.notice }
  }
}


module.exports = SettingController
