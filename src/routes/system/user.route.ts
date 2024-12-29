import { ZodRouter } from 'koa-zod-router'
import { z } from 'zod'
import { BadRequesetError, parseAndThrowZodError } from '../../helper/error.helper'
import { convertPageParam, PrismaObj } from '../../prisma'
import { Context } from 'koa'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { UserType } from '../../types'

export const UserRoute = (zodRouter: ZodRouter) => {
  // * 创建用户
  zodRouter.register({
    name: 'createUser',
    method: 'post',
    path: '/user',
    validate: {
      continueOnError: true,
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
        name: z.string({ message: '用户名不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      const userInfo: UserType = ctx.request.body
      const INIT_PWD = '123456'

      parseAndThrowZodError(ctx)
      const userExist = await PrismaObj.user.findFirst({
        where: { phone: userInfo.phone, delFlag: 0 }
      })
      if (userExist) {
        throw new BadRequesetError('手机号已经存在')
      }

      userInfo.password = bcrypt.hashSync(INIT_PWD, 10)
      await PrismaObj.user.create({ data: userInfo })
      ctx.body = 'ok'
    }
  })

  // * 更新用户
  zodRouter.register({
    name: 'updateUser',
    method: 'put',
    path: '/user',
    validate: {
      continueOnError: true,
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
        name: z.string({ message: '用户名不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const userInfo: UserType = ctx.request.body
      const oldUserInfo = await PrismaObj.user.findFirst({
        where: {
          id: {
            not: userInfo.id
          },
          phone: userInfo.phone,
          delFlag: 0
        }
      })
      if (oldUserInfo) throw new BadRequesetError('手机号已经存在')
      await PrismaObj.user.update({
        where: { id: userInfo.id, delFlag: 0 },
        data: userInfo
      })
      ctx.body = 'ok'
    }
  })

  // * 删除用户
  zodRouter.register({
    name: 'removeUser',
    method: 'delete',
    path: '/user/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.number({ message: '用户ID不能为空' }).int().positive()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params

      await PrismaObj.user.update({
        where: { id: Number(id), delFlag: 0 },
        data: { delFlag: 1 }
      })

      ctx.body = 'ok'
    }
  })

  // * 获取用户列表
  zodRouter.register({
    name: 'userList',
    method: 'get',
    path: '/user/list',
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
      const { pageNo, pageSize, name } = ctx.query
      const pageParam = convertPageParam(pageNo, pageSize)
      const condition: Prisma.UserWhereInput = {
        delFlag: 0,
        name: name ? { startsWith: name as string } : undefined
      }
      const records = await PrismaObj.user.findMany({
        where: condition,
        ...pageParam
      })
      const total = await PrismaObj.user.count({ where: condition })
      ctx.body = { records, total }
    }
  })

  // * 获取用户信息
  zodRouter.register({
    name: 'userInfo',
    method: 'get',
    path: '/user/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.coerce.number()
      })
    },
    handler: async (ctx: Context) => {
      const { id } = ctx.params
      const userInfo = await PrismaObj.user.findUnique({
        where: { id, delFlag: 0 },
        select: {
          id: true,
          name: true,
          phone: true,
          roleId: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      })
      ctx.body = userInfo
    }
  })
}
