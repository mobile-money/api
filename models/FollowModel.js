// 粉丝

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const CONFIGS = require('../configs')
const { timestamp } = require('../libs')


const schema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'User',
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: timestamp,
  },
}, CONFIGS.SCHEMA_OPTIONS)


schema.plugin(mongoosePaginate)


module.exports = mongoose.model('Follow', schema)
