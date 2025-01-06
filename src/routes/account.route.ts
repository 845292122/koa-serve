import { Context } from 'koa'
import { ZodRouter } from 'koa-zod-router'
import { z } from 'zod'
import { AccountType } from '../types'
import { BadRequesetError, parseAndThrowZodError } from '../helper/error.helper'
import { convertPageParam, PrismaObj } from '../prisma'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

export const AccountRoute = (router: ZodRouter) => {
  /**
   * * 新增账户
   */
  router.post({
    path: '/account',
    validate: {
      continueOnError: true,
      body: z.object({
        contact: z.string({ message: '联系人不能为空' }),
        phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
      })
    },
    handler: async (ctx: Context) => {
      const accountInfo: AccountType = ctx.request.body
      const INIT_PWD = '123456'

      parseAndThrowZodError(ctx)
      if (accountInfo.id) throw new BadRequesetError('用户ID存在')
      const accountExist = await PrismaObj.account.findFirst({
        where: { phone: accountInfo.phone, delFlag: 0 }
      })

      if (accountExist) {
        throw new BadRequesetError('手机号已经存在')
      }

      accountInfo.password = bcrypt.hashSync(INIT_PWD, 10)
      await PrismaObj.account.create({ data: accountInfo })
      ctx.body = 'ok'
    }
  })

  /**
   * * 更新账户
   */
  router.put({
    path: '/account',
    validate: {
      continueOnError: true,
      body: z.object({
        phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
        contact: z.string({ message: '联系人不能为空' })
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const accountInfo: AccountType = ctx.request.body
      const oldInfo = await PrismaObj.account.findFirst({
        where: {
          id: {
            not: accountInfo.id
          },
          phone: accountInfo.phone,
          delFlag: 0
        }
      })

      if (oldInfo) throw new BadRequesetError('手机号已经存在')
      await PrismaObj.account.update({
        where: { id: accountInfo.id, delFlag: 0 },
        data: accountInfo
      })

      ctx.body = 'ok'
    }
  })

  /**
   * * 删除账户
   */
  router.delete({
    path: '/account/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.number({ message: '账户ID不能为空' }).int().positive()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params

      await PrismaObj.account.update({
        where: { id: Number(id), delFlag: 0 },
        data: { delFlag: 1 }
      })

      ctx.body = 'ok'
    }
  })

  //
  /**
   * * 获取账户列表
   * TODO 查询字段不需要全查
   */
  router.get({
    path: '/account/list',
    validate: {
      continueOnError: true,
      query: z.object({
        pageNo: z.coerce.number().default(1),
        pageSize: z.coerce.number().default(10),
        company: z.string().optional()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { pageNo, pageSize, company } = ctx.query
      const pageParam = convertPageParam(pageNo, pageSize)
      const condition: Prisma.AccountWhereInput = {
        delFlag: 0,
        company: company ? { startsWith: company as string } : undefined
      }
      const records = await PrismaObj.account.findMany({
        where: condition,
        ...pageParam
      })
      const total = await PrismaObj.account.count({ where: condition })
      ctx.body = { records, total }
    }
  })

  /**
   * * 获取账户详情
   * TODO 查询字段不需要全查
   */
  router.get({
    path: '/account/:id',
    validate: {
      continueOnError: true,
      params: z.object({
        id: z.coerce.number()
      })
    },
    handler: async (ctx: Context) => {
      parseAndThrowZodError(ctx)
      const { id } = ctx.params
      const account = await PrismaObj.account.findUnique({
        where: { id: Number(id), delFlag: 0 }
      })
      ctx.body = account
    }
  })
}
