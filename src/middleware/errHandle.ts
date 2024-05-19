import { Context, Next } from 'koa'

export const errHandleMiddleware = async (ctx: Context, next: Next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 200
      ctx.body = {
        code: 401,
        msg: '认证过期',
      }
    } else {
      ctx.body = {
        code: err.code || 500,
        msg: err.message.trim() || '操作失败',
      }
      ctx.status = 500
    }
    return Promise.resolve()
  })
}
