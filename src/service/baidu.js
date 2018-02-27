module.exports = class extends think.Service {
  constructor(ctx, config) {
    super();
    this.ctx = ctx;
    this.config = config;
  }

  login() {
    const display = /Android|webOS|iPhone|iPad|iPod|ucweb|BlackBerry|IEMobile|Opera Mini/i.test(this.ctx.request.header['user-agent']) ? 'mobile' : 'popup';
    this.ctx.status = 302;
    this.ctx.redirect(`http://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=${this.config.appkey}&redirect_uri=${encodeURIComponent(this.config.callback)}&scope=basic&display=${display}`);
  }

  async getToken() {
    const self = this;
    return await this.fetch(`https://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code=${this.ctx.query.code}&client_id=${this.config.appkey}&client_secret=${this.config.secretkey}&redirect_uri=${encodeURIComponent(this.config.callback)}`, {
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
    const userinfo = await this.fetch(`https://openapi.baidu.com/rest/2.0/passport/users/getInfo?access_token=${data.access_token}`).then(res => res.json());
    return {
      uid: userinfo.userid,
      name: userinfo.username,
      info: {
        avatar: `http://tb.himg.baidu.com/sys/portrait/item/${userinfo.portrait}`
      },
      type: 'baidu'
    };
  }
};
