// 设置

const mongoose = require('mongoose')
const CONFIGS = require('../configs')


const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'User',
  },
  notice: {
    followed: {
      type: Boolean,
      default: true,
    },
    inspected: {
      type: Boolean,
      default: true,
    },
    commented: {
      type: Boolean,
      default: true,
    },
    starred: {
      type: Boolean,
      default: true,
    },
    shared: {
      type: Boolean,
      default: true,
    },
    recommended: {
      type: Boolean,
      default: true,
    },
  },
}, CONFIGS.SCHEMA_OPTIONS)


module.exports = mongoose.model('Setting', schema)
