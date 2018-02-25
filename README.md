# [第三方登录WEB网站示例](https://xuexb.com/web-oauth-app)

## 声明

该项目只是用户走通整个第三方的流程，并写出对应的思路，代码不提供参考价值，因为太渣！

## 使用技术

- 后端基于 [NodeJS v7.8+](http://nodejs.org/) + [ThinkJS v3](http://thinkjs.org/)
- 数据库基于 MySQL
- 前端样式基于 [Bootstrap v4](https://v4.bootcss.com/)
- 代码托管于 [GitHub@xuexb/web-oauth-app](https://github.com/xuexb/web-oauth-app)
- 示例链接 <https://xuexb.com/web-oauth-app>

## 数据库

```
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `oauth`
-- ----------------------------
DROP TABLE IF EXISTS `oauth`;
CREATE TABLE `oauth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` char(50) NOT NULL COMMENT '类型，有 qq、github、weibo',
  `uid` varchar(255) NOT NULL COMMENT '唯一标识',
  `info` varchar(255) DEFAULT '' COMMENT '其他信息，JSON 形式',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `create_time` bigint(13) NOT NULL COMMENT '创建时间',
  `name` varchar(255) DEFAULT NULL COMMENT '显示名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
--  Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `create_time` bigint(13) NOT NULL COMMENT '创建时间',
  `update_time` bigint(13) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
```

## 第三方说明

- 每个用户必须拥有自己的用户名和密码。
- 每个用户可以绑定不同的第三方帐户系统。
- 用户可以对第三方绑定进行管理。
- 用户可以通过已绑定的任意第三方帐户系统进行登录。
- 用户授权表中需要存放第三方系统的唯一标识、显示名称，唯一标识用来和用户、第三方系统进行关联。
- 基于 oAuth2.0 进行授权认证。

### GitHub

1. 跳转到授权页 `https://github.com/login/oauth/authorize?`
1. 认证通过后自动跳转到回调地址，并携带 `code`
2. 使用 `code` 请求 `https://github.com/login/oauth/access_token` 来获取 `access_token` ，有个小坑是，在想使用 JSON 返回值时，需要在请求头里添加 `'Accept': 'application/json'`
3. 使用 `access_token` 请求 `https://api.github.com/` 获取用户信息：
    - `id` - 唯一标识
    - `name` - 显示名称
    - `avatar_url` - 用户头像

参考链接：<https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/>

### QQ

1. 跳转到授权页 `https://graph.qq.com/oauth2.0/show?which=Login&display=` ，有个小坑是，WEB端和移动端传的 `display` 参数不一样，需要单独处理下
1. 认证通过后自动跳转到参数 `redirect_uri` 中，并携带 `code`
2. 使用 `code` 请求 `https://graph.qq.com/oauth2.0/token?` 获取 `access_token` ，有个大坑是成功时返回 `access_token=xxx` ，错误时返回 `callback( {code: xxx} )` ，好尴尬。。。
3. 使用 `access_token` 请求 `https://graph.qq.com/oauth2.0/me?` 获取 `openid` ，而这里又是返回个 `callback({"openid": "1"})`
4. 使用 `access_token` 和 `openid` 请求 `https://graph.qq.com/user/get_user_info` 来获取用户信息，最终为：
    - `openid` - 唯一标识
    - `nickname` - 显示名称
    - `figureurl_qq_2` - 用户头像

参数链接：[http://wiki.connect.qq.com/开发攻略_server-side](http://wiki.connect.qq.com/%E5%BC%80%E5%8F%91%E6%94%BB%E7%95%A5_server-side)

### 微博

1. 跳转到授权页 `https://api.weibo.com/oauth2/authorize`
1. 认证通过后自动跳转到参数 `redirect_uri` 中，并携带 `code`
2. 使用 `code` 请求 `https://api.weibo.com/oauth2/access_token?` 获取 `access_token`
3. 使用 `access_token` 请求 `https://api.weibo.com/2/users/show.json` 获取用户信息，最终为：
    - `access_token` - 唯一标识
    - `screen_name` - 显示名称
    - `avatar_hd` - 用户头像

参考链接：[http://open.weibo.com/wiki/授权机制说明](http://open.weibo.com/wiki/%E6%8E%88%E6%9D%83%E6%9C%BA%E5%88%B6%E8%AF%B4%E6%98%8E)

## 隐私声明

- 本项目只是演示示例，登录、注册的密码通过 MD5 加密后存储于 MySQL 中。
- 第三方登录相关信息不会对外暴露。
- 所有数据不定期的进行删除。

## License
MIT