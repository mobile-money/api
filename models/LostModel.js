// 忘记密码的用户

const mongoose = require('mongoose')
const CONFIGS = require('../configs')
const { timestamp } = require('../libs')


const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'User',
  },
  code: {
    type: String,
    required: true,
    trim: true,
    validate: CONFIGS.VALIDATE_RANDOM_CODE,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: timestamp,
  },
}, CONFIGS.SCHEMA_OPTIONS)


module.exports = mongoose.model('Lost', schema)
