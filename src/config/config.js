const pkg = require('../../package.json');

module.exports = Object.assign({}, {pkg}, {
  workers: 1,
  port: 8020,
  oauth: {
    github: {
    },
    qq: {
    },
    weibo: {
    }
  }
});
