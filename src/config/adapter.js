const fileCache = require('think-cache-file');
const nunjucks = require('think-view-nunjucks');
const fileSession = require('think-session-file');
const {Console, DateFile} = require('think-logger3');
const mysql = require('think-model-mysql');
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
  dateFile: {
    handle: DateFile,
    level: 'ALL',
    absolute: true,

    // 如果是 Docker 运行，则配合 Dockerfile 输出日志
    pattern: process.env.DOCKER ? '' : '-yyyy-MM-dd',
    alwaysIncludePattern: process.env.DOCKER ? false : true,
    filename: process.env.DOCKER ? '/var/log/node.log' : path.join(think.ROOT_PATH, 'logs/app.log')
  }
};

// 数据库配置
exports.model = {
  type: 'mysql', // 默认使用的类型，调用时可以指定参数切换
  common: { // 通用配置
    logConnect: true, // 是否打印数据库连接信息
    logSql: true, // 是否打印 SQL 语句
    logger: msg => think.logger.info(msg) // 打印信息的 logger
  },
  mysql: {
    handle: mysql, // Adapter handle
    user: process.env.MYSQL_USER || 'root', // 用户名
    password: process.env.MYSQL_PASSWORD || '', // 密码
    database: process.env.MYSQL_DATABASE || '', // 数据库
    host: process.env.MYSQL_HOST || '127.0.0.1', // host
    port: process.env.MYSQL_PORT || 3306, // 端口
    connectionLimit: 1, // 连接池的连接个数，默认为 1
    prefix: process.env.MYSQL_PREFIX || '', // 数据表前缀，如果一个数据库里有多个项目，那项目之间的数据表可以通过前缀来区分
    acquireWaitTimeout: 0 // 等待连接的超时时间，避免获取不到连接一直卡在那里，开发环境下有用
  }
};
