const moment = require('moment')


/**
 * 获取一个时间距离当前时间的秒数
 */
module.exports = datetime => Math.round((+moment(datetime) - Date.now()) / 1000)
