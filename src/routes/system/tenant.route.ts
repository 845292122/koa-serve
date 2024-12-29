import { Context } from 'koa'
import { ZodRouter } from 'koa-zod-router'
import { TenantType } from '../../types/tenant'
import { BadRequesetError, parseAndThrowZodError } from '../../helper/error.helper'
import { convertPageParam, PrismaObj } from '../../prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export const TenantRoute = (zodRouter: ZodRouter) => {
  // * 创建租户
  zodRouter.register({
    name: 'createTenant',
    method: 'post',
    path: '/tenant',
    validate: {
      continueOnError: true,
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
        name: z.string({ message: '租户名称不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      const tenantInfo: TenantType = ctx.request.body
      parseAndThrowZodError(ctx)
      const tenantExist = await PrismaObj.tenant.findFirst({
        where: {
          phone: tenantInfo.phone,
          delFlag: 0
        }
      })
      if (tenantExist) throw new BadRequesetError('该手机号已被注册')
      const newTenant = await PrismaObj.tenant.create({
        data: tenantInfo
      })
      ctx.body = newTenant
    }
  })

  // * 更新租户信息
  zodRouter.register({
    name: 'updateTenant',
    method: 'put',
    path: '/tenant',
    validate: {
      continueOnError: true,
      body: z.object({
        id: z.number({ message: '租户id不能为空' }),
        phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
        name: z.string({ message: '租户名称不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const tenantInfo: TenantType = ctx.request.body
      const tenantExist = await PrismaObj.tenant.findFirst({
        where: {
          id: {
            not: tenantInfo.id
          },
          phone: tenantInfo.phone,
          delFlag: 0
        }
      })
      if (tenantExist) throw new BadRequesetError('手机号已经注册')
      await PrismaObj.tenant.update({
        where: { id: tenantInfo.id, delFlag: 0 },
        data: tenantInfo
      })
      ctx.body = 'ok'
    }
  })

  // * 删除租户
  zodRouter.register({
    name: 'removeTenant',
    method: 'delete',
    path: '/tenant/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.number({ message: '租户id不能为空' }).int().positive()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params
      await PrismaObj.tenant.update({
        where: { id, delFlag: 0 },
        data: { delFlag: 1 }
      })
      ctx.body = 'ok'
    }
  })

  // * 租户列表
  zodRouter.register({
    name: 'tenantList',
    method: 'get',
    path: '/tenant/list',
    validate: {
      continueOnError: true,
      query: z.object({
        pageNo: z.coerce.number().default(1),
        pageSize: z.coerce.number().default(10),
        name: z.string().optional()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { name, pageNo, pageSize } = ctx.query
      const pageParam = convertPageParam(pageNo, pageSize)
      const condition: Prisma.TenantWhereInput = {
        delFlag: 0,
        name: name ? { startsWith: name as string } : undefined
      }
      const records = await PrismaObj.tenant.findMany({
        where: condition,
        ...pageParam
      })
      const total = await PrismaObj.tenant.count({ where: condition })
      ctx.body = { records, total }
    }
  })

  // * 租户信息
  zodRouter.register({
    name: 'tenantInfo',
    method: 'get',
    path: '/tenant/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.coerce.number().int().positive()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params
      const tenantInfo = await PrismaObj.tenant.findUnique({
        where: { id, delFlag: 0 }
      })
      ctx.body = tenantInfo
    }
  })
}
