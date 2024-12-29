import { Context, Next } from 'koa'

export const respMiddleware = async (ctx: Context, next: Next) => {
  ctx.ok = (data: any) => {
    ctx.status = 200
    ctx.body = {
      code: 200,
      data
    }
  }
  await next()
}
