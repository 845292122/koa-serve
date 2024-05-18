import { Context, Next } from 'koa'

export const respMiddleware = () => {
  return async (ctx: Context, next: Next) => {
    ctx.ok = (data: any) => {
      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'ok',
        data,
      }
    }
    ctx.fail = (code: number, msg: string) => {
      ctx.status = 500
      ctx.body = {
        code,
        msg: msg || 'fail',
      }
    }
    await next()
  }
}
