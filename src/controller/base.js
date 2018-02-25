/**
 * 信息在 cookie 里的名称
 *
 * @const
 * @type {string}
 */
const MSG_COOKIE_KEY = 'showMsg';

/**
 * 信息在模板里的变量名称
 *
 * @const
 * @type {string}
 */
const MSG_TPL_KEY = 'showMsg';

/**
 * 信息类似在模板里的变量名称
 *
 * @const
 * @type {string}
 */
const MSG_TYPE_TPL_KEY = 'showMsgType';

module.exports = class extends think.Controller {
  /**
   * 前置操作，处理用户登录状态、显示信息
   */
  async __before() {
    const userinfo = await this.session('userinfo');
    console.log(userinfo);
    this.userinfo = userinfo;
    this.isLogin = !!userinfo;
    this.assign({userinfo});

    // 处理显示信息
    const msg = this.cookie(MSG_COOKIE_KEY);
    if (msg) {
      this.assign(MSG_TPL_KEY, decodeURIComponent(msg));
      this.assign(MSG_TYPE_TPL_KEY, decodeURIComponent(msg).indexOf('成功') > -1 ? 'success' : 'danger');
      this.cookie(MSG_COOKIE_KEY, null);
    }
  }

  /**
   * 显示信息到页面中
   *
   * @param  {string} text 显示文本
   * @param  {string} url  跳转链接
   *
   * @return {Object}
   */
  async showMsg(text, url) {
    if (this.isPost || url) {
      this.cookie(MSG_COOKIE_KEY, encodeURIComponent(text));
      return this.redirect(url || this.ctx.url);
    }

    this.assign(MSG_TPL_KEY, text);
    return this.display();
  }

  /**
   * 写入用户信息到 session
   *
   * @param  {number} id 用户ID
   */
  async writeUserinfo(id) {
    const user = await this.model('user').where({
      id
    }).find();

    if (!think.isEmpty(user)) {
      delete user.password;
      await this.session('userinfo', user);
    }
  }
};
