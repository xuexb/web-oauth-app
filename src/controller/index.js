/**
 * @file MIP 登录项目
 * @author xuexb <fe.xiaowu@gmail.com>
 */

const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * 首页
   *
   * @return {Object}
   */
  async indexAction() {
    return this.display();
  }
};
