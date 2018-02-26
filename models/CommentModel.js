// 评论

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const CONFIGS = require('../configs')
const { timestamp } = require('../libs')


const schema = new mongoose.Schema({
  art: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'Art',
  },
  commentUser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'User',
  },
  repliedUser: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: 'User',
  },
  content: {
    type: String,
    required: true,
    trim: true,
    validate: CONFIGS.VALIDATE_COMMENT_CONTENT,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: timestamp,
  },
}, CONFIGS.SCHEMA_OPTIONS)


schema.plugin(mongoosePaginate)


module.exports = mongoose.model('Comment', schema)
