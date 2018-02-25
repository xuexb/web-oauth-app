const Base = require('./base.js');

module.exports = class extends Base {
  regAction() {
    if (this.isPost) {
      const rules = {
        username: {
          required: true,
          length: {
            min: 5,
            max: 16
          }
        },
        password: {
          required: true,
          length: {
            min: 5,
            max: 16
          }
        },
        password2: {
          equals: 'password'
        }
      };

      if (!this.validate(rules)) {
        return this.showMsg();
      }
    }
  }

  changepasswordAction() {
    if (this.isPost) {
      const rules = {
        password: {
          required: true,
          length: {
            min: 5,
            max: 16
          }
        },
        newpassword: {
          required: true,
          length: {
            min: 5,
            max: 16
          }
        },
        newpassword2: {
          equals: 'newpassword'
        }
      };

      if (!this.validate(rules)) {
        return this.showMsg();
      }
    }
  }

  oauthLoginAction() {
    const rules = {
      type: {
        required: true,
        in: ['github']
      }
    };

    this.allowMethods = 'get';

    if (!this.validate(rules)) {
      return this.showMsg('/');
    }
  }

  oauthDeleteAction() {
    return this.oauthLoginAction();
  }

  oauthCallbackAction() {
    const rules = {
      type: {
        required: true,
        in: ['github']
      },
      code: {
        requiredIf: ['type', 'github'],
        method: 'GET'
      }
    };

    this.allowMethods = 'get';

    if (!this.validate(rules)) {
      return this.showMsg('/');
    }
  }

  loginAction() {
    if (this.isPost) {
      const rules = {
        username: {
          required: true,
          length: {
            min: 5,
            max: 16
          }
        },
        password: {
          required: true,
          length: {
            min: 5,
            max: 16
          }
        }
      };

      if (!this.validate(rules)) {
        return this.showMsg();
      }
    }
  }
};
