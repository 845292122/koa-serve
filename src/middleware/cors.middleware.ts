import { Context } from 'koa'

export const corsMiddleware = {
  // 允许来自所有域名请求
  origin: function (ctx: Context) {
    return '*'
  },
  //设置获取其他自定义字段
  exposeHeaders: ['Authorization'],
  //指定本次预检请求的有效期，单位为秒。
  maxAge: 5,
  //设置所允许的HTTP请求方法
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  //设置服务器支持的所有头信息字段
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}
