import { ZodRouter } from 'koa-zod-router'
import { z } from 'zod'
import { BadRequesetError, parseAndThrowZodError } from '../../helper/error.helper'
import { Context } from 'koa'
import { RoleType } from '../../types/role'
import { convertPageParam, PrismaObj } from '../../prisma'
import { Prisma } from '@prisma/client'

export const RoleRoute = (zodRouter: ZodRouter) => {
  // * 创建角色
  zodRouter.post({
    path: '/system/role',
    validate: {
      continueOnError: true,
      body: z.object({
        name: z.string({ message: '角色名称不能为空' }),
        key: z.string({ message: '角色标识不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const roleInfo: RoleType = ctx.request.body
      const roleExist = await PrismaObj.role.findFirst({
        where: { key: roleInfo.key, delFlag: 0 }
      })
      if (roleExist) throw new BadRequesetError('角色已存在')

      await PrismaObj.role.create({ data: roleInfo })
      ctx.body = 'ok'
    }
  })

  // * 更新角色
  zodRouter.put({
    path: '/system/role',
    validate: {
      continueOnError: true,
      body: z.object({
        name: z.string({ message: '角色名称不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const roleInfo: RoleType = ctx.request.body
      const oldRoleInfo = await PrismaObj.role.findFirst({
        where: {
          id: {
            not: roleInfo.id
          },
          key: roleInfo.key,
          delFlag: 0
        }
      })
      if (oldRoleInfo) throw new BadRequesetError('角色已存在')
      await PrismaObj.role.update({ where: { id: roleInfo.id, delFlag: 0 }, data: roleInfo })
      ctx.body = 'ok'
    }
  })

  // * 删除角色
  zodRouter.delete({
    path: '/system/role/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.number({ message: '用户ID不能为空' }).int().positive()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params
      await PrismaObj.role.update({ where: { id: Number(id), delFlag: 0 }, data: { delFlag: 1 } })
      ctx.body = 'ok'
    }
  })

  // * 获取角色列表
  zodRouter.get({
    path: '/system/role/list',
    validate: {
      continueOnError: true,
      query: z.object({
        pageNo: z.coerce.number().int().positive().default(1),
        pageSize: z.coerce.number().int().positive().default(10),
        name: z.string().optional()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { pageNo, pageSize, name, status } = ctx.query
      const pageParam = convertPageParam(pageNo, pageSize)
      const condition: Prisma.RoleWhereInput = {
        delFlag: 0,
        name: name ? { startsWith: name as string } : undefined,
        status: status ? Number(status) : undefined
      }
      const records = await PrismaObj.role.findMany({
        where: condition,
        ...pageParam
      })
      const total = await PrismaObj.role.count({ where: condition })
      ctx.body = { records, total }
    }
  })

  // * 获取用户信息
  zodRouter.get({
    path: '/system/role/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.coerce.number()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params
      const roleInfo = await PrismaObj.role.findUnique({ where: { id: Number(id) } })
      ctx.body = roleInfo
    }
  })
}
