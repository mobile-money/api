const randomString = require('random-string')


/**
 * 生成随机 code，32位，包括数字，字母
 */
const getCode = () => randomString({ length: 32 })


module.exports = getCode
