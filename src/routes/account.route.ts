import bcrypt from 'bcryptjs'
import { Context } from 'koa'
import { ZodRouter } from 'koa-zod-router'
import { z } from 'zod'
import { BadRequesetError, prismaUtil } from '../utils'

export const accountRoutes = (zodRouter: ZodRouter) => {
  /**
   * 创建账号
   */
  zodRouter.register({
    name: 'createAccount',
    method: 'post',
    path: '/account/create',
    // pre:
    validate: {
      continueOnError: true,
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
        contact: z.string({ message: '联系人不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      const accountInfo = ctx.request.body
      const INIT_PWD = '123456'

      if (ctx.invalid.error && ctx.invalid.body) {
        const errArr: Array<any> = JSON.parse(ctx.invalid.body)
        const errMsg = errArr.map(err => err.message).join(',')
        throw new BadRequesetError(errMsg)
      }

      const accountExist = await prismaUtil.account.findUnique({
        where: { phone: accountInfo.phone }
      })

      if (accountExist) {
        throw new BadRequesetError('手机号已存在')
      }

      accountInfo.password = bcrypt.hashSync(INIT_PWD, 10)
      const newAccount = await prismaUtil.account.create({
        data: accountInfo
      })

      ctx.body = newAccount
    }
  })

  /**
   * 查询账号
   */
  zodRouter.register({
    name: 'queryAccount',
    method: 'get',
    path: '/account/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.coerce.number()
      })
    },
    handler: async (ctx: Context) => {
      const { params } = ctx.request.query
      console.log(params)
      ctx.body = { msg: 'hello' }
    }
  })
}
