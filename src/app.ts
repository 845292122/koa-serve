import addressIp from 'ip'
import koa from 'koa'
import koaBody from 'koa-body'
import koaJwt from 'koa-jwt'
import koaPinoLogger from 'koa-pino-logger'
import koaStatic from 'koa-static'
import koaCors from 'koa2-cors'
import path from 'path'

import { JWT_SECRET, JWT_WHITE_LIST } from './core/constant'
import { corsMiddleware, errorHandleMiddleware, respMiddleware } from './middleware'
import router from './routes'

/**
 * 初始化Koa
 *
 * errHandleMiddleware: 全局错误处理
 * koaPinoLogger: 日志处理(ctx.log.)
 * koaCors: 跨域处理
 * koaBody: http请求解析
 * koaStatic: 静态资源映射
 * koaJwt: jwt校验
 * router.routes: 路由注册
 *
 */

const APP_PORT = 3000
const app = new koa()
app.use(errorHandleMiddleware)
app.use(respMiddleware)
app.use(koaPinoLogger())
app.use(koaCors(corsMiddleware))
app.use(
  koaBody({
    // 开启文件上传
    multipart: true,
    formidable: {
      // 上传路径
      uploadDir: path.join(__dirname, '../public/uploads'),
      // 保留文件扩展名
      keepExtensions: true
    }
  })
)
app.use(koaStatic(path.join(__dirname, '../public/')))

// app.use(
//   koaJwt({ secret: JWT_SECRET, key: 'user', isRevoked: checkTokenRevoked }).unless({
//     path: JWT_WHITE_LIST
//   })
// )

app.use(router.routes()).use(router.allowedMethods())

app.listen(APP_PORT, () => {
  console.log(`koa server is running at  /n http://${addressIp.address()}:${APP_PORT}`)
})

module.exports = app
