const { createHmac } = require('crypto')


/**
 * 密码加密函数
 * @param {String} password 密码
 * @param {String} signature 随机签名
 * @returns {String} 加密后的字符串
 */
const encryptPassword = (password, signature) => {
  return createHmac('sha256', signature).update(password).digest('base64')
}


module.exports = encryptPassword
