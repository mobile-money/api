// 作品

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const CONFIGS = require('../configs')
const { OSSService } = require('../services')
const { timestamp, getSecondsFromNow } = require('../libs')


const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: 'User',
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
    validate: CONFIGS.VALIDATE_ART_DESCRIPTION,
  },
  images: [{
    path: {
      type: String,
      required: true,
      trim: true,
    },
    mime: {
      type: String,
      required: true,
      trim: true,
      enum: CONFIGS.MIME_IMAGES,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    cover: Boolean,
  }],
  viewsCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  starredCount: {
    type: Number,
    default: 0,
  },
  sharedCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    trim: true,
    enum: [
      'inspecting', // 正在审核中
      'passed', // 审核成功
      'failed', // 审核失败
    ],
    default: 'inspecting',
  },
  failedReason: {
    type: String,
    trim: true,
    validate: CONFIGS.VALIDATE_ART_FAILED_REASON,
  },
  recommended: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: timestamp,
  },
}, CONFIGS.SCHEMA_OPTIONS)


schema.virtual('smallCoverUrl').get(function () {
  if (!this.images.length) return ''

  let cover = this.images.find(image => image.cover)
  if (!cover) cover = this.images[0]

  return OSSService.signatureUrl(cover.path, {
    expires: getSecondsFromNow('3000-01-01'),
    height: 300,
    fill: true,
  })
})

schema.virtual('largeCoverUrl').get(function () {
  if (!this.images.length) return ''

  let cover = this.images.find(image => image.cover)
  if (!cover) cover = this.images[0]

  return OSSService.signatureUrl(cover.path, {
    expires: getSecondsFromNow('3000-01-01'),
    width: 600,
    fill: true,
  })
})

schema.virtual('thumbnailUrls').get(function () {
  if (!this.images.length) return []

  const urls = []

  this.images.forEach(image => {
    urls.push(OSSService.signatureUrl(image.path, {
      expires: getSecondsFromNow('3000-01-01'),
      width: 100,
      height: 100,
      fill: true,
    }))
  })

  return urls
})

schema.virtual('imageUrls').get(function () {
  if (!this.images.length) return []

  const urls = []

  this.images.forEach(image => {
    urls.push(OSSService.signatureUrl(image.path, {
      expires: getSecondsFromNow('3000-01-01'),
    }))
  })

  return urls
})


schema.plugin(mongoosePaginate)

module.exports = mongoose.model('Art', schema)
