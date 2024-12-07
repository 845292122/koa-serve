import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Context } from 'koa'
import { ZodRouter } from 'koa-zod-router'
import { z } from 'zod'
import { JWT_SECRET } from '../core/constant'
import { BadRequesetError, prismaUtil } from '../utils'
import { AuthType } from '../types'

export const authRoutes = (zodRouter: ZodRouter) => {
  /**
   * 登录
   */
  zodRouter.register({
    name: 'login',
    method: 'post',
    path: '/auth/login',
    validate: {
      continueOnError: true,
      body: z.object({
        phone: z.string({ message: '手机号不能为空' }).regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
        password: z.string({ message: '密码不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      const loginParam: AuthType.LoginInfo = ctx.request.body

      if (ctx.invalid.error && ctx.invalid.body) {
        // TODO: 需要优化,抽成一个func
        const errArr: Array<any> = JSON.parse(ctx.invalid.body)
        const errMsg = errArr.map(err => err.message).join(',')
        throw new BadRequesetError(errMsg)
      }

      const account: any = await prismaUtil.account.findUnique({
        where: {
          phone: loginParam.phone
        }
      })

      if (!account) {
        throw new BadRequesetError('手机号或密码不正确')
      }
      if (!bcrypt.compareSync(loginParam.password, account.password)) {
        throw new BadRequesetError('手机号或密码不正确')
      }

      const payload = {
        id: account.id,
        phone: account.phone,
        isAdmin: account.isAdmin
      }

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
      ctx.ok(token)
    }
  })

  /**
   * 获取认证信息
   */
  zodRouter.register({
    name: 'authInfo',
    method: 'get',
    path: '/auth/info',
    handler: async (ctx: Context) => {
      const { id } = ctx.state?.user || {}
      const authInfo: any = await prismaUtil.account.findUnique({
        where: {
          id
        }
      })
      delete authInfo?.password
      ctx.ok(authInfo)
    }
  })
}
