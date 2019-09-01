const pkg = require('../../package.json');

module.exports = Object.assign({}, {pkg}, {
  workers: 1,
  port: 8080,
  oauth: {
    github: {
      client_id: '',
      client_secret: ''
    },
    qq: {
      appid: 0,
      appkey: '',
      callback: ''
    },
    weibo: {
      appkey: 0,
      appsecret: '',
      callback: ''
    },
    baidu: {
      appkey: '',
      secretkey: '',
      callback: ''
    }
  }
});
