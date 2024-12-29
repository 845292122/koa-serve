import { Context, Next } from 'koa'
import { ZodRouter } from 'koa-zod-router'
import { z } from 'zod'
import { BadRequesetError, parseAndThrowZodError } from '../../helper/error.helper'
import { PrismaObj } from '../../prisma'
import { PermissionType } from '../../types/permission'

export const PermissionRoute = (zodRouter: ZodRouter) => {
  // * 创建权限
  zodRouter.post({
    path: '/permission',
    pre: async (ctx: Context, next: Next) => {
      ctx.log.info(ctx)
      await next()
    },
    validate: {
      continueOnError: true,
      body: z.object({
        permission: z.string({ message: '权限名称不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const permissionInfo: PermissionType = ctx.request.body
      const permissionExist = await PrismaObj.permission.findFirst({
        where: { permission: permissionInfo.permission, delFlag: 0 }
      })
      if (permissionExist) throw new BadRequesetError('权限已存在')
      await PrismaObj.permission.create({ data: permissionInfo })
      ctx.body = 'ok'
    }
  })
}
