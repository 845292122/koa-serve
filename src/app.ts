import AddressIP from 'ip'
import Koa from 'koa'
import KoaBody from 'koa-body'
import KoaJwt from 'koa-jwt'
import KoaLogger from 'koa-logger'
import KoaStatic from 'koa-static'
import KoaCors from 'koa2-cors'
import Path from 'path'
import { JWT_SECRET, JWT_WHITE_LIST } from './core/constant'
import { corsMiddleware } from './middleware/cors'
import { errHandleMiddleware } from './middleware/errHandle'
import { respMiddleware } from './middleware/resp'

// 启动端口号
const port = 3000
const app = new Koa()

// 日志处理
app.use(KoaLogger((str) => console.log(new Date() + str)))

// 错误处理
app.use(errHandleMiddleware)

// 跨域处理
app.use(KoaCors(corsMiddleware))

// 统一响应处理
app.use(respMiddleware)

// http请求解析
app.use(
  KoaBody({
    // 开启文件上传
    multipart: true,
    formidable: {
      // 上传路径
      uploadDir: Path.join(__dirname, '../public/uploads'),
      // 保留文件扩展名
      keepExtensions: true,
    },
  })
)

// 静态资源映射
app.use(KoaStatic(Path.join(__dirname, '../public/')))

// JWT校验
app.use(
  KoaJwt({ secret: JWT_SECRET }).unless({
    path: JWT_WHITE_LIST,
  })
)

// 服务端口监听
app.listen(port, () => {
  console.log(`koa server is running at  /n http://${AddressIP.address()}:${port}`)
})

module.exports = app
