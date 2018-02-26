const co = require('co')
const _ = require('lodash')
const moment = require('moment')
const AliOSS = require('ali-oss')
const { ObjectId } = require('bson')
const { createHmac } = require('crypto')

const CONFIGS = require('../configs')
const { getPathByDate } = require('../libs')

const oss = new AliOSS(CONFIGS.OSS_CONFIGS)
const ALLOW_TYPES = ['art', 'avatar', 'background']


const getTicket = (type, suffix, body) => {
  if (!ALLOW_TYPES.includes(type)) throw new TypeError('`type` must be one of \'art\', \'avatar\' or \'background\'')
  if (!CONFIGS.MIME_SUFFIXES.includes(suffix)) throw new TypeError('`suffix` not allowed')

  // Dir and path
  const dir = CONFIGS[`OSS_${type.toUpperCase()}S_PATH`] + getPathByDate()
  const path = dir + ObjectId() + suffix

  // Callback
  let url = ''

  if (type === 'art') url = '/art/callback'
  if (type === 'avatar') url = '/user/avatar/callback'
  if (type === 'background') url = '/user/background/callback'

  let callback = {
    callbackUrl: url,
    callbackBody: getCallbackBody(body),
    callbackBodyType: 'application/json',
  }

  callback = Buffer.from(JSON.stringify(callback)).toString('base64')

  // Policy
  const seconds = CONFIGS.NODE_ENV_PRODUCTION ? 60 : 361440
  const expiration = moment().add(seconds, 's').toDate()
  const conditions = [
    [ 'content-length-range', 0, 20971520 ],
    [ 'starts-with', '$key', dir ],
    { callback },
  ]
  const policy = Buffer.from(JSON.stringify({ expiration, conditions })).toString('base64')

  // Signature
  const signature = createHmac('sha1', CONFIGS.OSS_CONFIGS.accessKeySecret).update(policy).digest('base64')

  return {
    host: CONFIGS.OSS_CONFIGS.endpoint,
    accessKeyId: CONFIGS.OSS_CONFIGS.accessKeyId,
    signature,
    policy,
    callback,
    path,
  }
}


const getCallbackBody = body => {
  if (!_.isPlainObject(body)) throw new TypeError('`body` muse be a plain object')

  const re = /"(\$\{.*?\})"/g
  const stringify = JSON.stringify(body)

  return stringify.replace(re, '$1')
}


const deleteObject = async object => {
  await co(function * () {
    yield oss.delete(object)
  })
}


const deleteMultiObjects = async objects => {
  await co(function * () {
    yield oss.deleteMulti(objects)
  })
}


const signatureUrl = (path, { expires, width, height, fill }) => {
  let process = 'image/resize'

  if (fill) process += ',m_fill'
  if (width) process += `,w_${width}`
  if (height) process += `,h_${height}`

  return oss.signatureUrl(path, {
    expires: expires,
    process: process,
  })
}


const OSSService = {
  oss,
  getTicket,
  getCallbackBody,
  deleteObject,
  deleteMultiObjects,
  signatureUrl,
}


module.exports = OSSService
