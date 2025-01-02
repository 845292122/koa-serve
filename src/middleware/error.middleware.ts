import { Context, Next } from 'koa'

export const errorHandleMiddleware = async (ctx: Context, next: Next) => {
  return await next().catch(err => {
    let code: number
    let msg: string

    if (err.name === 'PrismaClientValidationError') {
      ctx.status = 200
      ctx.body = { code: 400, msg: 'prismaError' }
      // ! TODO: ctx.log没生效
      ctx.log.error(err.message)
      return Promise.resolve()
    }

    switch (err.status) {
      case 401:
        code = 401
        msg = '认证过期'
        break
      case 403:
        code = 403
        msg = '没有授权'
        break
      case 400:
        code = 400
        msg = err.message ?? '请求错误'
        break
      default:
        code = err.status ?? 500
        msg = err.message ?? '未知错误'
        break
    }

    ctx.status = 200
    ctx.body = { code, msg }

    return Promise.resolve()
  })
}
