/**
 * 获取一个日期的时间戳，主要用于从数据库获取日期时格式化日期
 * @param {Date} date
 * @returns {number}
 */
module.exports = date => date instanceof Date ? date.getTime() : date
