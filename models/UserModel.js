// 用户

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const CONFIGS = require('../configs')
const { OSSService } = require('../services')
const { timestamp, getSecondsFromNow } = require('../libs')


const schema = new mongoose.Schema({
  account: {
    type: String,
    required: true,
    trim: true,
    validate: CONFIGS.VALIDATE_USER_ACCOUNT,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    validate: CONFIGS.VALIDATE_USER_NAME,
  },
  signature: {
    type: String,
    required: true,
    trim: true,
    validate: CONFIGS.VALIDATE_USER_SIGNATURE,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    validate: CONFIGS.VALIDATE_USER_EMAIL,
  },
  unsuppressible: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    required: true,
    enum: CONFIGS.COLORS,
  },
  avatar: {
    path: {
      type: String,
      trim: true,
    },
    width: Number,
    height: Number,
  },
  background: {
    path: {
      type: String,
      trim: true,
    },
    width: Number,
    height: Number,
  },
  country: {
    type: String,
    trim: true,
    default: '',
    validate: CONFIGS.VALIDATE_USER_COUNTRY,
  },
  city: {
    type: String,
    trim: true,
    default: '',
    validate: CONFIGS.VALIDATE_USER_CITY,
  },
  introduction: {
    type: String,
    trim: true,
    default: '',
    validate: CONFIGS.VALIDATE_USER_INTRODUCTION,
  },
  links: [{
    name: {
      type: String,
      trim: true,
      default: '',
      validate: CONFIGS.VALIDATE_USER_LINK_NAME,
    },
    content: {
      type: String,
      trim: true,
      default: '',
      validate: CONFIGS.VALIDATE_USER_LINK_CONTENT,
    },
  }],
  contacts: [{
    name: {
      type: String,
      trim: true,
      default: '',
      validate: CONFIGS.VALIDATE_USER_CONTACT_NAME,
    },
    content: {
      type: String,
      trim: true,
      default: '',
      validate: CONFIGS.VALIDATE_USER_CONTACT_CONTENT,
    },
  }],
  artsCount: {
    type: Number,
    default: 0,
  },
  followingsCount: {
    type: Number,
    default: 0,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  starsCount: {
    type: Number,
    default: 0,
  },
  sharesCount: {
    type: Number,
    default: 0,
  },
  usedStorage: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: timestamp,
  },
  updatedAt: {
    type: Date,
    get: timestamp,
    default: Date.now,
  },
}, CONFIGS.SCHEMA_OPTIONS)


schema.virtual('smallAvatarUrl').get(function () {
  if (!this.avatar || !this.avatar.path) return ''
  return OSSService.signatureUrl(this.avatar.path, {
    expires: getSecondsFromNow('3000-01-01'),
    width: 36,
    height: 36,
    fill: true,
  })
})

schema.virtual('mediumAvatarUrl').get(function () {
  if (!this.avatar || !this.avatar.path) return ''
  return OSSService.signatureUrl(this.avatar.path, {
    expires: getSecondsFromNow('3000-01-01'),
    width: 100,
    height: 100,
    fill: true,
  })
})

schema.virtual('largeAvatarUrl').get(function () {
  if (!this.avatar || !this.avatar.path) return ''
  const size = Math.min(this.avatar.width, this.avatar.height)
  return OSSService.signatureUrl(this.avatar.path, {
    expires: getSecondsFromNow('3000-01-01'),
    width: size,
    height: size,
    fill: true,
  })
})


schema.virtual('smallBackgroundUrl').get(function () {
  if (!this.background || !this.background.path) return ''
  return OSSService.signatureUrl(this.background.path, {
    expires: getSecondsFromNow('3000-01-01'),
    width: 400,
  })
})

schema.virtual('mediumBackgroundUrl').get(function () {
  if (!this.background || !this.background.path) return ''
  return OSSService.signatureUrl(this.background.path, {
    expires: getSecondsFromNow('3000-01-01'),
    width: 1024,
  })
})

schema.virtual('largeBackgroundUrl').get(function () {
  if (!this.background || !this.background.path) return ''
  return OSSService.signatureUrl(this.background.path, {
    expires: getSecondsFromNow('3000-01-01'),
  })
})


schema.plugin(mongoosePaginate)


module.exports = mongoose.model('User', schema)
