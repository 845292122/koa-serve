import { Context, Next } from 'koa'
import { ZodRouter } from 'koa-zod-router'
import { z } from 'zod'
import { BadRequesetError, parseAndThrowZodError } from '../../helper/error.helper'
import { convertPageParam, PrismaObj } from '../../prisma'
import { PermissionType } from '../../types/permission'
import { Prisma } from '@prisma/client'

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

  // * 更新权限
  zodRouter.put({
    path: '/permission',
    validate: {
      continueOnError: true,
      body: z.object({
        permission: z.string({ message: '权限名称不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const permissionInfo: PermissionType = ctx.request.body
      const oldPermInfo = await PrismaObj.permission.findFirst({
        where: {
          id: {
            not: permissionInfo.id
          },
          permission: permissionInfo.permission,
          delFlag: 0
        }
      })
      if (oldPermInfo) throw new BadRequesetError('权限已存在')
      await PrismaObj.permission.update({
        where: { id: permissionInfo.id, delFlag: 0 },
        data: permissionInfo
      })
      ctx.body = 'ok'
    }
  })

  // * 删除权限
  zodRouter.delete({
    path: '/permission/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.number({ message: '权限id不能为空' }).int().positive()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params
      await PrismaObj.permission.update({
        where: { id: Number(id), delFlag: 0 },
        data: { delFlag: 1 }
      })
      ctx.body = 'ok'
    }
  })

  // * 获取权限列表
  zodRouter.get({
    path: '/permission/list',
    validate: {
      continueOnError: true,
      query: z.object({
        pageNo: z.coerce.number().default(1),
        pageSize: z.coerce.number().default(10),
        permission: z.string().optional()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { pageNo, pageSize, permission } = ctx.query
      const pageParam = convertPageParam(pageNo, pageSize)
      const condition: Prisma.PermissionWhereInput = {
        delFlag: 0,
        permission: permission ? { startsWith: permission as string } : undefined
      }
      const records = await PrismaObj.permission.findMany({
        where: condition,
        ...pageParam
      })
      const total = await PrismaObj.permission.count({ where: condition })
      ctx.body = { records, total }
    }
  })

  // * 获取权限信息
  zodRouter.get({
    path: '/permission/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.number({ message: '权限id不能为空' }).int().positive()
      })
    },
    handler: async (ctx: Context) => {
      const { id } = ctx.params
      const permissionInfo = await PrismaObj.permission.findUnique({
        where: { id: Number(id), delFlag: 0 }
      })
      ctx.body = permissionInfo
    }
  })
}
