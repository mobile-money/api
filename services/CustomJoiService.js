// 自定义 Joi 验证规则

const Joi = require('joi')
const { ObjectId } = require('bson')
const jsonwebtoken = require('jsonwebtoken')
const CONFIGS = require('../configs')


const CustomJoi = Joi.extend(joi => ({
  name: 'string',
  base: joi.string(),
  rules: [
    {
      name: 'account',
      validate (params, value, state, options) {
        if (!CONFIGS.VALIDATE_USER_ACCOUNT(value)) {
          return this.createError('string.account', { v: value }, state, options)
        }
        return value
      },
    },
    {
      name: 'password',
      validate (params, value, state, options) {
        if (!CONFIGS.VALIDATE_USER_PASSWORD(value)) {
          return this.createError('string.password', { v: value }, state, options)
        }
        return value
      },
    },
    {
      name: 'single',
      validate (params, value, state, options) {
        if (!/^.*$/.test(value)) {
          return this.createError('string.single', { v: value }, state, options)
        }
        return value
      },
    },
    {
      name: 'code',
      validate (params, value, state, options) {
        if (!/^\w*$/.test(value)) {
          return this.createError('string.code', { v: value }, state, options)
        }
        return value
      },
    },
    {
      name: 'id',
      validate (params, value, state, options) {
        if (!ObjectId.isValid(value)) {
          return this.createError('string.id', { v: value }, state, options)
        }
        return value
      },
    },
    {
      name: 'jwt',
      validate (params, value, state, options) {
        if (!jsonwebtoken.verify(value, CONFIGS.SECRET_JWT)) {
          return this.createError('string.jwt', { v: value }, state, options)
        }
        return value
      },
    },
  ],
}))


CustomJoi.account = () => CustomJoi.string().trim().account().error(new TypeError('Invalid account'))
CustomJoi.username = () => CustomJoi.string().trim().single().min(1).max(32).error(new TypeError('Invalid username'))
CustomJoi.email = () => CustomJoi.string().trim().lowercase().email().error(new TypeError('Invalid email'))
CustomJoi.password = () => CustomJoi.string().trim().password().min(6).max(32).error(new TypeError('Invalid password'))
CustomJoi.oldPassword = () => CustomJoi.string().trim().password().min(6).max(32).error(new TypeError('Invalid oldPassword'))
CustomJoi.newPassword = () => CustomJoi.string().trim().password().min(6).max(32).error(new TypeError('Invalid newPassword'))
CustomJoi.id = () => CustomJoi.string().trim().id()
CustomJoi.code = () => CustomJoi.string().trim().code().length(32).error(new TypeError('Invalid code'))
CustomJoi.page = () => CustomJoi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).default(1).error(new TypeError('Invalid page'))
CustomJoi.limit = () => CustomJoi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).default(20).error(new TypeError('Invalid limit'))
CustomJoi.start = () => CustomJoi.date().error(new TypeError('Invalid start'))
CustomJoi.end = () => CustomJoi.date().error(new TypeError('Invalid end'))
CustomJoi.mime = () => CustomJoi.string().trim().lowercase().allow(CONFIGS.MIME_IMAGES).error(new TypeError('Invalid mime'))
CustomJoi.suffix = () => CustomJoi.string().trim().lowercase().allow(CONFIGS.MIME_SUFFIXES).error(new TypeError('Invalid suffix'))
CustomJoi.color = () => CustomJoi.string().trim().uppercase().allow(CONFIGS.COLORS).error(new TypeError('Invalid color'))
CustomJoi.token = () => CustomJoi.string().trim().jwt().error(new TypeError('Invalid token'))
CustomJoi.path = () => CustomJoi.string().trim().error(new TypeError('Invalid path'))
CustomJoi.cover = () => CustomJoi.boolean().default(false).error(new TypeError('Invalid cover'))
CustomJoi.width = () => CustomJoi.number().integer().min(0).error(new TypeError('Invalid width'))
CustomJoi.height = () => CustomJoi.number().integer().min(0).error(new TypeError('Invalid height'))
CustomJoi.size = () => CustomJoi.number().integer().min(0).max(20971520).error(new TypeError('Invalid size'))
CustomJoi.country = () => CustomJoi.string().trim().single().min(0).max(32).error(new TypeError('Invalid country'))
CustomJoi.city = () => CustomJoi.string().trim().single().min(0).max(32).error(new TypeError('Invalid city'))
CustomJoi.introduction = () => CustomJoi.string().trim().single().min(0).max(64).error(new TypeError('Invalid introduction'))
CustomJoi.linkName = () => CustomJoi.string().trim().single().min(1).max(32).error(new TypeError('Invalid name'))
CustomJoi.linkContent = () => CustomJoi.string().trim().single().min(1).max(128).error(new TypeError('Invalid content'))
CustomJoi.contactName = () => CustomJoi.string().trim().single().min(1).max(32).error(new TypeError('Invalid name'))
CustomJoi.contactContent = () => CustomJoi.string().trim().single().min(1).max(128).error(new TypeError('Invalid content'))

CustomJoi.enum = (allows, defaultValue) => {
  if (!Array.isArray(allows)) throw new TypeError('`allows` param must be an array')
  const validation = CustomJoi.string().trim().lowercase().allow(allows)
  return defaultValue ? validation.default(defaultValue) : validation
}

CustomJoi.userId = () => CustomJoi.id().error(new TypeError('Invalid userId'))
CustomJoi.artId = () => CustomJoi.id().error(new TypeError('Invalid artId'))
CustomJoi.categoryId = () => CustomJoi.id().error(new TypeError('Invalid categoryId'))
CustomJoi.commentId = () => CustomJoi.id().error(new TypeError('Invalid commentId'))
CustomJoi.followId = () => CustomJoi.id().error(new TypeError('Invalid followId'))
CustomJoi.noticeId = () => CustomJoi.id().error(new TypeError('Invalid noticeId'))
CustomJoi.shareId = () => CustomJoi.id().error(new TypeError('Invalid shareId'))
CustomJoi.starId = () => CustomJoi.id().error(new TypeError('Invalid starId'))

CustomJoi.loginName = () => CustomJoi.alternatives().try(CustomJoi.string().trim().account(), CustomJoi.string().trim().lowercase().email()).error(new TypeError('Invalid loginName'))
CustomJoi.artsClassify = () => CustomJoi.enum(['all', 'recommended', 'random'], 'all').error(new TypeError('Invalid classify'))
CustomJoi.artsSortBy = () => CustomJoi.enum(['time', 'starred', 'shared'], 'time').error(new TypeError('Invalid sortBy'))
CustomJoi.userArtsStatus = () => CustomJoi.enum(['all', 'inspecting', 'passed', 'failed', 'recommended'], 'all').error(new TypeError('Invalid status'))
CustomJoi.artDescription = () => CustomJoi.string().max(1024).error(new TypeError('Invalid description'))
CustomJoi.artCallbackOrder = () => CustomJoi.number().integer().min(0).max(31).error(new TypeError('Invalid order'))
CustomJoi.categoryName = () => CustomJoi.string().trim().single().min(1).max(32).error(new TypeError('Invalid name'))
CustomJoi.commentRepliedUserId = () => CustomJoi.id().error(new TypeError('Invalid repliedUserId'))
CustomJoi.commentContent = () => CustomJoi.string().trim().min(1).max(256).error(new TypeError('Invalid content'))
CustomJoi.noticeClassify = () => CustomJoi.enum(['all', 'unread'], 'all').error(new TypeError('Invalid classify'))
CustomJoi.usersClassify = () => CustomJoi.enum(['all', 'random'], 'all').error(new TypeError('Invalid classify'))
CustomJoi.usersSortBy = () => CustomJoi.enum(['time', 'arts', 'followers'], 'time').error(new TypeError('Invalid sortBy'))
CustomJoi.userExistanceType = () => CustomJoi.enum(['account', 'username', 'email']).error(new TypeError('Invalid type'))
CustomJoi.userExistanceContent = () => CustomJoi.alternatives().try(CustomJoi.string().trim().account(), CustomJoi.string().trim().single().min(1).max(32), CustomJoi.string().trim().lowercase().email()).error(new TypeError('Invalid content'))

CustomJoi.artImages = () =>
  CustomJoi.array().items(CustomJoi.object().keys({
    mime: CustomJoi.mime().required(),
    suffix: CustomJoi.suffix().required(),
    cover: CustomJoi.cover().optional(),
  })).min(1).max(32).error(new TypeError('Invalid images'))

CustomJoi.noticeSettings = () =>
  CustomJoi.object().keys({
    followed: CustomJoi.boolean().optional(),
    inspected: CustomJoi.boolean().optional(),
    commented: CustomJoi.boolean().optional(),
    starred: CustomJoi.boolean().optional(),
    shared: CustomJoi.boolean().optional(),
    recommended: CustomJoi.boolean().optional(),
  }).error(new TypeError('Invalid notice'))

CustomJoi.links = () =>
  CustomJoi.array().items(CustomJoi.object().keys({
    name: CustomJoi.linkName().required(),
    content: CustomJoi.linkContent().required(),
  })).error(new TypeError('Invalid links'))

CustomJoi.contacts = () =>
  CustomJoi.array().items(CustomJoi.object().keys({
    name: CustomJoi.contactName().required(),
    content: CustomJoi.contactContent().required(),
  })).error(new TypeError('Invalid contacts'))


module.exports = CustomJoi
