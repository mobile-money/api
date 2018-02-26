// 动态

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
    trim: true,
    enum: ['art', 'share'],
  },
  art: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: 'Art',
  },
  share: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
    ref: 'Share',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: timestamp,
  },
}, CONFIGS.SCHEMA_OPTIONS)


schema.plugin(mongoosePaginate)


module.exports = mongoose.model('Feed', schema)
