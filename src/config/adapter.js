const fileCache = require('think-cache-file');
const nunjucks = require('think-view-nunjucks');
const fileSession = require('think-session-file');
const {Console, File, DateFile} = require('think-logger3');
const path = require('path');
const isDev = think.env === 'development';

/**
 * cache adapter config
 * @type {Object}
 */
exports.cache = {
  type: 'file',
  common: {
    timeout: 24 * 60 * 60 * 1000 // millisecond
  },
  file: {
    handle: fileCache,
    cachePath: path.join(think.ROOT_PATH, 'runtime/cache'), // absoulte path is necessarily required
    pathDepth: 1,
    gcInterval: 24 * 60 * 60 * 1000 // gc interval
  }
};

/**
 * session adapter config
 * @type {Object}
 */
exports.session = {
  type: 'file',
  common: {
    cookie: {
      name: 'thinkjs'
      // keys: ['werwer', 'werwer'],
      // signed: true
    }
  },
  file: {
    handle: fileSession,
    sessionPath: path.join(think.ROOT_PATH, 'runtime/session')
  }
};

/**
 * view adapter config
 * @type {Object}
 */
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    sep: '_',
    extname: '.html'
  },
  nunjucks: {
    handle: nunjucks,
    options: {
      lstripBlocks: true,
      trimBlocks: true
    },
    beforeRender(env, nunjucks, config) {
      env.addFilter('format', (unix = Date.now(), str = 'yyyy-MM-dd HH:mm') => {
        const date = new Date(parseInt(unix, 10));
        const getTime = {
          'M+': date.getMonth() + 1,
          'd+': date.getDate(),
          'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
          'H+': date.getHours(),
          'm+': date.getMinutes(),
          's+': date.getSeconds()
        };

        // 如果有年
        if (/(y+)/i.test(str)) {
          str = str.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }

        Object.keys(getTime).forEach(key => {
          if (new RegExp('(' + key + ')').test(str)) {
            str = str.replace(RegExp.$1, (RegExp.$1.length === 1) ? (getTime[key]) : (('00' + getTime[key]).substr(('' + getTime[key]).length)));
          }
        });

        return str;
      });
    }
  }
};

/**
 * logger adapter config
 * @type {Object}
 */
exports.logger = {
  type: isDev ? 'console' : 'dateFile',
  console: {
    handle: Console
  },
  file: {
    handle: File,
    backups: 10, // max chunk number
    absolute: true,
    maxLogSize: 50 * 1024, // 50M
    filename: path.join(think.ROOT_PATH, 'logs/app.log')
  },
  dateFile: {
    handle: DateFile,
    level: 'ALL',
    absolute: true,
    pattern: '-yyyy-MM-dd',
    alwaysIncludePattern: true,
    filename: path.join(think.ROOT_PATH, 'logs/app.log')
  }
};
