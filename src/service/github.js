const github = new require('github')({
  timeout: 10000
});

module.exports = class extends think.Service {
  constructor(ctx, config) {
    super();
    this.ctx = ctx;
    this.config = config;
  }

  login() {
    this.ctx.status = 302;
    this.ctx.redirect(`https://github.com/login/oauth/authorize?client_id=${this.config.client_id}&scope=read:user,user:email`);
  }

  async getToken() {
    return await this.fetch(`https://github.com/login/oauth/access_token?client_id=${this.config.client_id}&client_secret=${this.config.client_secret}&code=${this.ctx.query.code}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json'
      },
      timeout: 10000
    }).then(res => res.json()).then(res => {
      // 如果过期再请求个新的
      if (!res.access_token) {
        return this.login();
      }
      this.access_token = res.access_token;
      return res.access_token;
    });
  }

  async getUserInfo() {
    const token = await this.getToken();
    if (!token) {
      return {};
    }
    github.authenticate({
      type: 'token',
      token
    });
    const userinfo = await github.users.get({});
    return {
      uid: userinfo.data.id,
      name: userinfo.data.name || 'github用户',
      info: {
        email: userinfo.data.email,
        avatar: userinfo.data.avatar_url
      },
      token,
      type: 'github'
    };
  }
};
