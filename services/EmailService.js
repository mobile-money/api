const nodemailer = require('nodemailer')
const CONFIGS = require('../configs')


const EmailService = {
  sendEmail: async ({ type, to, userId, code }) => {
    let configs, url, options

    if (type === 'register') {
      configs = CONFIGS.SMTP_REGISTER
      url = `${CONFIGS.ADDRESS_API}/verification?userId=${userId}&code=${code}`
      options = {
        from: '"Endtour" <register@endtour.com>',
        to,
        subject: '邮箱验证',
        html: `
          <p>非常感谢您注册 endtour.com。</p>
          <p>您可以点击或在新窗口打开此链接 <a href="${url}" target="_blank">${url}</a> 来验证您的邮箱。</p>
          <p>此链接1小时之内有效，请尽快完成验证。</p>
        `,
      }
    }

    if (type === 'lost') {
      configs = CONFIGS.SMTP_LOST
      url = `${CONFIGS.ADDRESS_WEB}/lost?userId=${userId}&code=${code}`
      options = {
        from: '"Endtour" <lost@endtour.com>',
        to,
        subject: '找回密码',
        html: `
          <p>您正在进行找回密码操作，请点击或在新窗口打开以下链接进行下一步操作。</p>
          <p><a href="${url}" target="_blank">${url}</a></p>
          <p>此链接1小时之内有效，请尽快完成操作。</p>
        `,
      }
    }

    if (type === 'email') {
      configs = CONFIGS.SMTP_ACCOUNT
      url = `${CONFIGS.ADDRESS_API}/verification?userId=${userId}&code=${code}`
      options = {
        from: '"Endtour" <account@endtour.com>',
        to,
        subject: '邮箱验证',
        html: `
          <p>您可以点击或在新窗口打开此链接 <a href="${url}" target="_blank">${url}</a> 来验证您的新邮箱。</p>
          <p>此链接1小时之内有效，请尽快完成验证。</p>
        `,
      }
    }

    const transporter = nodemailer.createTransport(configs)
    await transporter.sendMail(options)
  },
}


module.exports = EmailService
