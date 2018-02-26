// 数据验证函数

const validator = require('validator')


module.exports = {

  // 用户账号。1-32位数字、字母或下划线组合；必须包含字母；不能为邮箱格式；系统唯一且大小写不明感。
  VALIDATE_USER_ACCOUNT: account => {
    const format = /^\w{1,32}$/
    const alphanumeric = /[A-Za-z]/
    if (!format.test(account)) return false
    if (!alphanumeric.test(account)) return false
    if (validator.isEmail(account)) return false
    return true
  },

  // 用户姓名。1-32位任意字符；系统唯一且大小写不明感。
  VALIDATE_USER_NAME: createSimpleValidation(1, 32),

  // 用户随机签名。32位随机字（字母和数字的组合）符串。系统自动生成。
  VALIDATE_USER_SIGNATURE: createSimpleValidation(32, 32, 'code'),

  // 用户密码。结合随机签名（signature）经过 sha256 加密生成。6-32位英文键盘能够输入的字符。
  VALIDATE_USER_PASSWORD: password => {
    const format = /^[0-9a-zA-Z!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~/\\]{6,32}$/
    if (!format.test(password)) return false
    return true
  },

  // 用户邮箱
  VALIDATE_USER_EMAIL: email => validator.isEmail(email),

  // 用户国家
  VALIDATE_USER_COUNTRY: createSimpleValidation(0, 32),

  // 用户城市
  VALIDATE_USER_CITY: createSimpleValidation(0, 32),

  // 用户个人简介
  VALIDATE_USER_INTRODUCTION: createSimpleValidation(0, 64),

  // 用户个人链接名称
  VALIDATE_USER_LINK_NAME: createSimpleValidation(1, 32),

  // 用户个人链接内容
  VALIDATE_USER_LINK_CONTENT: createSimpleValidation(1, 128),

  // 用户联系方式名称
  VALIDATE_USER_CONTACT_NAME: createSimpleValidation(1, 32),

  // 用户联系方式内容
  VALIDATE_USER_CONTACT_CONTENT: createSimpleValidation(1, 128),

  // 作品描述
  VALIDATE_ART_DESCRIPTION: description => description.length <= 1024,

  // 作品审核失败原因
  VALIDATE_ART_FAILED_REASON: reason => reason.length <= 1024,

  // 分类名称
  VALIDATE_CATEGORY_NAME: createSimpleValidation(1, 32),

  // 评论内容
  VALIDATE_COMMENT_CONTENT: content => content.length >= 1 && content.length <= 256,

  // 随机验证码
  VALIDATE_RANDOM_CODE: createSimpleValidation(32, 32, 'code'),
}


// 创建简单的验证函数
function createSimpleValidation (min, max, type = 'any') {
  let format, range

  if (min === max) {
    range = `{${min}}`
  } else {
    range = `{${min},${max}}`
  }

  if (type === 'any') {
    format = `^.${range}$`
  } else if (type === 'code') {
    format = `^\\w${range}$`
  }

  format = new RegExp(format)

  return value => format.test(value)
}
