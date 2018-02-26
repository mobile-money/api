// 分类

const mongoose = require('mongoose')
const CONFIGS = require('../configs')


const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'User',
  },
  categories: [{
    name: {
      type: String,
      required: true,
      trim: true,
      validate: CONFIGS.VALIDATE_CATEGORY_NAME,
    },
  }],
}, CONFIGS.SCHEMA_OPTIONS)


module.exports = mongoose.model('Category', schema)
