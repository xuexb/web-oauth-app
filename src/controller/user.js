const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * 前置处理用户信息验证、注入第三方登录信息
   */
  async __before() {
    await super.__before();

    if (['login', 'reg', 'exit', 'oauthLogin', 'oauthCallback'].indexOf(this.ctx.action) == -1 && !this.isLogin) {
      return this.showMsg('请先登录', `${this.config('pkg.prefix')}/user/login`);
    }

    if (['login', 'reg'].indexOf(this.ctx.action) > -1 && this.cookie('oauth')) {
      const oauth = JSON.parse(decodeURIComponent(this.cookie('oauth')));
      this.assign('oauth', oauth);
      this.oauth = oauth;
    }
  }

  /**
   * 授权回调
   *
   * @return {Object}
   */
  async oauthCallbackAction() {
    const type = this.get('type');
    const service = think.service(type, this.ctx, this.config(`oauth.${type}`));

    try {
      // 获取第三方标识
      const userinfo = await service.getUserInfo();
      const oauth = await this.model('oauth').where({uid: userinfo.uid, type}).find();

      // 如果当前是登录状态，则判断第三方有没有绑定过其他帐户
      if (this.userinfo) {
        if (!think.isEmpty(oauth) && this.userinfo.id === oauth.user_id) {
          return this.showMsg('已经绑定通过', `${this.config('pkg.prefix')}/user/oauth`);
        } else if (!think.isEmpty(oauth)) {
          return this.showMsg(`该${type}已经绑定其他帐号`, `${this.config('pkg.prefix')}/user/oauth`);
        } else {
          await this.model('oauth').add({
            type: type,
            name: userinfo.name,
            uid: userinfo.uid,
            info: JSON.stringify(userinfo.info),
            user_id: this.userinfo.id,
            create_time: Date.now()
          });
          return this.showMsg(`绑定成功`, `${this.config('pkg.prefix')}/user/oauth`);
        }
      }

      // 已经绑定
      if (!think.isEmpty(oauth)) {
        const user = await this.model('user').where({id: oauth.user_id}).find();
        if (!think.isEmpty(user)) {
          // 写入 session
          delete user.password;
          await this.session('userinfo', user);
          return this.showMsg(`登录成功，欢迎通过${type}登录！`, `${this.config('pkg.prefix')}/user`);
        } else {
          // 用户都不存在了，授权数据可以删了。这可能就是传说中的人一走，茶就凉吧。。。
          await this.model('oauth').where({uid: userinfo.uid, type}).delete();
        }
      }

      // 记录当前第三方信息，用来登录、注册后绑定
      this.cookie('oauth', encodeURIComponent(JSON.stringify(userinfo)));
      return this.redirect(`${this.config('pkg.prefix')}/user/login`);
    } catch (e) {
      console.error(e)
      return this.showMsg(`${type} 登录失败`, this.userinfo ? `${this.config('pkg.prefix')}/user/oauth` : `${this.config('pkg.prefix')}/user/login`);
    }
  }

  /**
   * 第三方登录
   *
   * @param {string} type 登录类型
   * @return {Object}
   */
  async oauthLoginAction() {
    const type = this.get('type');
    return think.service(type, this.ctx, this.config(`oauth.${type}`)).login();
  }

  /**
   * 登录
   *
   * @param {string} username 用户名
   * @param {string} password 密码
   * @return {Object}
   */
  async loginAction() {
    if (this.isGet) {
      return this.display();
    }

    const {username, password} = this.post();
    const first = await this.model('user').where({
      username
    }).find();

    if (think.isEmpty(first)) {
      return this.showMsg('用户名不存在');
    }

    const user = await this.model('user').where({username, password: think.md5(password)}).find();
    if (think.isEmpty(user)) {
      return this.showMsg('用户名或者密码错误');
    }

    // 判断绑定第三方登录
    if (this.oauth) {
      const oauth = await this.model('oauth').where({type: this.oauth.type, user_id: user.id}).find();
      // 已经绑定其他帐号
      if (!think.isEmpty(oauth)) {
        return this.showMsg(`该用户名已经绑定其他${this.oauth.type}帐号`);
      }

      await this.model('oauth').add({
        type: this.oauth.type,
        name: this.oauth.name,
        uid: this.oauth.uid,
        info: JSON.stringify(this.oauth.info),
        user_id: user.id,
        create_time: Date.now()
      });
      this.cookie('oauth', null);

      // 更新登录时间
      await this.model('user').where({
        id: user.id
      }).update({
        update_time: Date.now()
      });

      // 写入 session
      await this.writeUserinfo(user.id);

      return this.showMsg('绑定登录成功', `${this.config('pkg.prefix')}/user`);
    }

    // 更新登录时间
    await this.model('user').where({
      id: user.id
    }).update({
      update_time: Date.now()
    });

    // 写入 session
    await this.writeUserinfo(user.id);

    return this.showMsg('登录成功', `${this.config('pkg.prefix')}/user`);
  }

  /**
   * 注册
   *
   * @return {Object}
   */
  async regAction() {
    if (this.isGet) {
      return this.display();
    }

    const {username, password} = this.post();
    const user = await this.model('user').where({username}).thenAdd({
      username,
      password: think.md5(password),
      create_time: Date.now(),
      update_time: Date.now()
    });

    // 写入 session
    await this.writeUserinfo(user.id);

    // 如果有第三方登录信息则关联
    if (this.oauth) {
      await this.model('oauth').add({
        type: this.oauth.type,
        name: this.oauth.name,
        uid: this.oauth.uid,
        info: JSON.stringify(this.oauth.info),
        user_id: user.id,
        create_time: Date.now()
      });
      this.cookie('oauth', null);
    }

    return this.showMsg(this.oauth ? '绑定注册成功' : '注册成功',`${this.config('pkg.prefix')}/user`);
  }

  /**
   * 退出
   *
   * @param {string} [ref=/] 退出成功后跳转链接
   * @return {Ojbect}
   */
  async exitAction() {
    await this.session('userinfo', null);
    this.cookie('oauth', null);
    return this.redirect(this.get('ref') || this.config('pkg.prefix'));
  }

  /**
   * 个人中心
   *
   * @return {Object}
   */
  async indexAction() {
    return this.display();
  }

  /**
   * 修改密码
   *
   * @return {Object}
   */
  async changepasswordAction() {
    if (this.isGet) {
      return this.display();
    }

    await this.model('user').where({id: this.userinfo.id}).update({
      password: think.md5(this.get('newpassword'))
    });

    return this.showMsg('更新成功');
  }

  /**
   * 销毁账户
   *
   * @return {Object}
   */
  async destroyAction() {
    await this.model('user').where({id: this.userinfo.id}).delete();
    await this.model('oauth').where({user_id: this.userinfo.id}).delete();
    return this.exitAction();
  }

  /**
   * 第三方授权管理
   *
   * @return {Object}
   */
  async oauthAction() {
    const oauth = Object.keys(this.config('oauth'));
    const items = [];

    for (const type of oauth) {
      const result = await this.model('oauth').where({
        user_id: this.userinfo.id,
        type
      }).find();
      if (!think.isEmpty(result)) {
        items.push(result);
      } else {
        items.push({
          type
        });
      }
    }

    this.assign('items', items);
    return this.display();
  }

  /**
   * 删除第三方登录授权
   *
   * @param {string} type 类型
   * @return {Object}
   */
  async oauthDeleteAction() {
    const type = this.get('type');
    await this.model('oauth').where({
      user_id: this.userinfo.id,
      type
    }).delete();

    return this.showMsg(`删除${type}授权成功`, `${this.config('pkg.prefix')}/user/oauth`);
  }
};
