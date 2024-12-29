import { Context, Next } from 'koa'

export const permMiddleware = async (ctx: Context, next: Next) => {
  const { isAdmin } = ctx.state?.user
  if (!ctx.state.user) {
    ctx.fail(401, '认证失败, 请重新登录')
    return
  }
  if (isAdmin) {
    await next()
  } else {
    ctx.fail(403, '没有权限, 请联系管理员')
    return
  }
}
