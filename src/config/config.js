const pkg = require('../../package.json');

module.exports = Object.assign({}, {pkg}, {
  workers: 1,
  oauth: {
    github: {
    }
  }
});
