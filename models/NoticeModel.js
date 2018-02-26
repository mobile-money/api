// 通知

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const CONFIGS = require('../configs')
const { timestamp } = require('../libs')


const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    enum: [
      'followed', // 被关注。
      'passed', // 作品审核通过。
      'failed', // 作品审核失败。
      'commented', // 作品被评论。
      'replied', // 评论回复。
      'starred', // 作品被收藏。
      'shared', // 作品被分享。
      'recommended', // 作品被系统推荐。
    ],
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: 'User',
  },
  relatedArt: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: 'Art',
  },
  content: String,
  createdAt: {
    type: Date,
    default: Date.now,
    get: timestamp,
  },
}, CONFIGS.SCHEMA_OPTIONS)


schema.plugin(mongoosePaginate)


module.exports = mongoose.model('Notice', schema)
