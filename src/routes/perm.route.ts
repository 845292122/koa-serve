import { ZodRouter } from 'koa-zod-router'
import { BadRequesetError, parseAndThrowZodError } from '../helper/error.helper'
import { z } from 'zod'
import { Context } from 'koa'
import { PermType } from '../types'
import { PrismaObj } from '../prisma'
import { Prisma } from '@prisma/client'

export const PermRoute = (router: ZodRouter) => {
  /**
   * * 新增权限
   */
  router.post({
    path: '/perm',
    validate: {
      continueOnError: true,
      body: z.object({
        key: z.string({ message: '权限标识不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      const permInfo: PermType = ctx.request.body
      parseAndThrowZodError(ctx)
      if (permInfo.id) throw new BadRequesetError('权限ID存在')
      const permExist = await PrismaObj.perm.findFirst({
        where: { key: permInfo.key, delFlag: 0 }
      })
      if (permExist) throw new BadRequesetError('权限已存在')
      await PrismaObj.perm.create({ data: permInfo })
      ctx.body = 'ok'
    }
  })

  /**
   * * 修改权限
   */
  router.put({
    path: '/perm',
    validate: {
      continueOnError: true,
      body: z.object({
        id: z.number({ message: '权限ID不能为空' }),
        key: z.string({ message: '权限标识不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const permInfo: PermType = ctx.request.body
      const oldInfo = await PrismaObj.perm.findFirst({
        where: {
          id: {
            not: permInfo.id
          },
          key: permInfo.key,
          delFlag: 0
        }
      })
      if (oldInfo) throw new BadRequesetError('权限已存在')
      await PrismaObj.perm.update({
        where: { id: permInfo.id, delFlag: 0 },
        data: permInfo
      })
      ctx.body = 'ok'
    }
  })

  /**
   * * 删除权限
   */
  router.delete({
    path: '/perm/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.number({ message: '权限ID不能为空' }).int().positive()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params
      await PrismaObj.perm.update({
        where: { id: Number(id), delFlag: 0 },
        data: { delFlag: 1 }
      })

      ctx.body = 'ok'
    }
  })

  /**
   * * 获取权限列表
   */
  router.get({
    path: '/perm/list',
    validate: {
      continueOnError: true,
      query: z.object({
        key: z.string().optional()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { key } = ctx.query
      const condition: Prisma.PermWhereInput = {
        delFlag: 0,
        key: key ? { startsWith: key as string } : undefined
      }
      const records = await PrismaObj.perm.findMany({
        where: condition
      })
      ctx.body = { records }
    }
  })

  /**
   * * 获取权限信息
   */
  router.get({
    path: '/perm/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.coerce.number()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params
      const permInfo = await PrismaObj.perm.findUnique({ where: { id: Number(id), delFlag: 0 } })
      ctx.body = permInfo
    }
  })
}
