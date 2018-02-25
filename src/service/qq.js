module.exports = class extends think.Service {
  constructor(ctx, config) {
    super();
    this.ctx = ctx;
    this.config = config;
  }

  login() {
    const display = /Android|webOS|iPhone|iPad|iPod|ucweb|BlackBerry|IEMobile|Opera Mini/i.test(this.ctx.request.header['user-agent']) ? 'mobile' : 'pc';
    this.ctx.status = 302;
    this.ctx.redirect(`https://graph.qq.com/oauth2.0/show?which=Login&display=${display}&client_id=${this.config.appid}&response_type=code&scope=get_user_info&redirect_uri=${encodeURIComponent(this.config.callback)}`);
  }

  async getToken() {
    const self = this;
    return await this.fetch(`https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${this.config.appid}&client_secret=${this.config.appkey}&code=${this.ctx.query.code}&redirect_uri=${encodeURIComponent(this.config.callback)}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
      timeout: 10000
    }).then(res => res.text()).then(text => {
      const matched = text.match(/access_token=([^&]+)&/);
      if (!matched) {
        return this.login();
      }
      return matched[1];
    }).then(async function (token) {
      return await self.fetch(`https://graph.qq.com/oauth2.0/me?access_token=${token}`).then(res => res.text()).then(text => {
        const matched = text.match(/\"openid\"\:\"([^\"]+)"/);
        if (!matched) {
          return self.login();
        }
        return {
          token,
          openid: matched[1]
        };
      })
    });
  }

  async getUserInfo() {
    const data = await this.getToken();
    if (!data) {
      return {};
    }

    const userinfo = await this.fetch(`https://graph.qq.com/user/get_user_info?access_token=${data.token}&oauth_consumer_key=${this.config.appid}&openid=${data.openid}`).then(res => res.json());
    return {
      uid: data.openid,
      name: userinfo.nickname || 'qq用户',
      info: {
        avatar: userinfo.figureurl_qq_2
      },
      type: 'qq'
    };
  }
};
