const pkg = require('../../package.json');

module.exports = Object.assign({}, {pkg}, {
  workers: 1,
  port: 8080,
  oauth: {
    github: {
      client_id: process.env.OAUTH_GITHUB_CLIENT_ID || '',
      client_secret: process.env.OAUTH_GITHUB_CLIENT_SECRET || ''
    },
    qq: {
      appid: process.env.OAUTH_QQ_APPID || 0,
      appkey: process.env.OAUTH_QQ_APPKEY || '',
      callback: process.env.OAUTH_QQ_CALLBACK || ''
    },
    weibo: {
      appkey: process.env.OAUTH_WEIBO_APPKEY || 0,
      appsecret: process.env.OAUTH_WEIBO_APPSECRET || '',
      callback: process.env.OAUTH_WEIBO_CALLBACK || ''
    },
    baidu: {
      appkey: process.env.OAUTH_BAIDU_APPKEY || '',
      secretkey: process.env.OAUTH_BAIDU_SECRETKEY || '',
      callback: process.env.OAUTH_BAIDU_CALLBACK || ''
    }
  }
});
