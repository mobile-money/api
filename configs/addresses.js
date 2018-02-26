// 服务器地址（web，API，mongodb，阿里云OSS回调地址）

const { NODE_ENV_TEST, NODE_ENV_PRODUCTION } = require('./envs')


module.exports = {

  // API 地址
  ADDRESS_API: NODE_ENV_PRODUCTION
    ? 'http://api.endtour.com'
    : NODE_ENV_TEST
      ? 'http://139.196.138.154:8888'
      : 'http://localhost:8888',

  // 阿里云OSS上传文件回调地址
  ADDRESS_ALI_OSS_CALLBACK: NODE_ENV_PRODUCTION
    ? 'http://api.endtour.com'
    : 'http://139.196.138.154:8888',

  // WEB 前端地址
  ADDRESS_WEB: NODE_ENV_PRODUCTION
    ? 'http://www.endtour.com'
    : NODE_ENV_TEST
      ? 'http://test-web.endtour.com'
      : 'http://localhost:3000',

  // Mongodb 地址
  ADDRESS_MONGODB: NODE_ENV_PRODUCTION
    ? '生产环境地址'
    : '测试环境地质',
}
