


module.exports = class extends think.Service {
  constructor(ctx, config) {
    super();
    this.ctx = ctx;
    this.config = config;
  }

  login() {
    this.ctx.status = 302;
    this.ctx.redirect(`https://api.weibo.com/oauth2/authorize?client_id=${this.config.appkey}&redirect_uri=${encodeURIComponent(this.config.callback)}`);
  }

  async getToken() {
    const self = this;
    return await this.fetch(`https://api.weibo.com/oauth2/access_token?client_id=${this.config.appkey}&client_secret=${this.config.appsecret}&grant_type=authorization_code&code=${this.ctx.query.code}&redirect_uri=${encodeURIComponent(this.config.callback)}`, {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
      },
      timeout: 10000
    }).then(res => res.json()).then(res => {
      if (!res.access_token) {
        return this.login();
      }
      return res;
    });
  }

  async getUserInfo() {
    const data = await this.getToken();
    if (!data) {
      return {};
    }
    const userinfo = await this.fetch(`https://api.weibo.com/2/users/show.json?access_token=${data.access_token}&uid=${data.uid}`).then(res => res.json());
    return {
      uid: data.access_token,
      name: userinfo.screen_name,
      info: {
        avatar: userinfo.avatar_hd
      },
      type: 'weibo'
    };
  }
};
