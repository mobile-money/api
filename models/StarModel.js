// 收藏

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
  art: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'Art',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: timestamp,
  },
}, CONFIGS.SCHEMA_OPTIONS)


schema.plugin(mongoosePaginate)


module.exports = mongoose.model('Star', schema)
