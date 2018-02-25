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

module.exports = class extends think.Logic {
  showMsg(url) {
    const text = Object.values(this.validateErrors).join(', ');

    if (this.isPost || url) {
      this.cookie(MSG_COOKIE_KEY, encodeURIComponent(text));
      return this.redirect(url || this.ctx.url);
    }

    this.assign(MSG_TPL_KEY, text);
    return this.display();
  }
};
