import { PrismaClient } from '@prisma/client'
import BCrypt from 'bcryptjs'
import { Context } from 'koa'
import { z } from 'zod'
import { AccountType } from '../types/account'
import { extractErrorMessage } from '../utils/validate'

const prisma = new PrismaClient()

export default class AccountApi {
  /**
   * 获取账户列表
   */
  public static async getAccountList(ctx: Context) {
    const queryParam = ctx.query
    const schema = z.object({
      pageSize: z
        .number()
        .min(1, { message: '每页最少显示1条' })
        .max(100, { message: '每页最多不能超过100条' })
        .default(10),
      pageNo: z.number().default(1),
    })
    try {
      const validRes = await schema.safeParseAsync(queryParam)
      if (!validRes.success) {
        const errMsg = extractErrorMessage(validRes.error.message)
        ctx.fail(400, errMsg)
        return
      }
      const query = validRes.data
      let whereCondition: any = {}
      const accountArr = await prisma.account.findMany({
        where: whereCondition,
        skip: (query.pageNo - 1) * query.pageSize,
        take: query.pageSize,
      })
      const count = await prisma.account.count({ where: whereCondition })
      ctx.ok({
        record: accountArr,
        total: count,
        pageSize: query.pageSize,
        pageNo: query.pageNo,
      })
    } catch (error: any) {
      ctx.fail(500, error.message || '操作失败')
    }
  }

  /**
   * 获取账户信息
   */
  public static async getAccountInfo(ctx: Context) {
    const accountId: string = ctx.params.id
    try {
      const accountInfo = await prisma.account.findFirst({
        where: {
          id: Number(accountId),
        },
      })
      if (!accountInfo) {
        ctx.fail(400, '账户不存在')
        return
      }
      ctx.ok(accountInfo)
    } catch (error: any) {
      ctx.fail(500, error.message || '获取账户信息失败')
    }
  }

  /**
   * 创建账户
   */
  public static async createAccount(ctx: Context) {
    const accountInfo = ctx.request.body
    const INIT_PWD = '123456'
    const schema = z.object({
      phone: z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
      contact: z.string({ message: '联系人不能为空' }),
    })
    try {
      const validRes = await schema.safeParseAsync(accountInfo)
      if (!validRes.success) {
        const errMsg = extractErrorMessage(validRes.error.message)
        ctx.fail(400, errMsg)
        return
      }
      const accountExist = await prisma.account.findUnique({
        where: { phone: accountInfo.phone },
      })

      if (accountExist) {
        ctx.fail(400, '手机号已存在')
        return
      }
      accountInfo.password = BCrypt.hashSync(INIT_PWD, 10)
      const newAccount = await prisma.account.create({
        data: accountInfo,
      })
      ctx.ok(newAccount)
    } catch (error: any) {
      ctx.fail(500, error.message || '创建账户失败')
    }
  }

  /**
   * 修改账户
   */
  public static async modifyAccount(ctx: Context) {
    const accountInfo = ctx.request.body
    const schema = z.object({
      phone: z.optional(z.string().regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })),
    })
    try {
      const validRes = await schema.safeParseAsync(accountInfo)
      if (!validRes.success) {
        const errMsg = extractErrorMessage(validRes.error.message)
        ctx.fail(400, errMsg)
        return
      }
      const accountExist = await prisma.account.findFirst({
        where: {
          phone: accountInfo.phone,
        },
      })
      if (accountExist && accountExist.id !== accountInfo.id) {
        ctx.fail(400, '手机号已存在')
        return
      }

      const newAccount = await prisma.account.update({
        data: accountInfo,
        where: { id: accountInfo.id },
      })
      ctx.ok(newAccount)
    } catch (error: any) {
      ctx.fail(500, error.message || '修改账户失败')
    }
  }

  /**
   * 删除账户
   */
  public static async removeAccount(ctx: Context) {
    const accountId = ctx.params.id
    try {
      await prisma.account.delete({
        where: { id: Number(accountId) },
      })
      ctx.ok()
    } catch (error: any) {
      ctx.fail(500, error.message || '删除账户失败')
    }
  }

  /**
   * 修改密码
   */
  public static async modifyPwd(ctx: Context) {
    const mpParam: AccountType.ModifyPwd = ctx.request.body
    const schema = z.object({
      oldPwd: z.string({ message: '请输入旧密码' }),
      newPwd: z.string({ message: '请输入新密码' }),
      confirmPwd: z.string({ message: '请输入确认密码' }),
    })
    try {
      const validRes = await schema.safeParseAsync(mpParam)
      if (!validRes.success) {
        const errMsg = extractErrorMessage(validRes.error.message)
        ctx.fail(400, errMsg)
        return
      }
      if (mpParam.newPwd !== mpParam.confirmPwd) {
        ctx.fail(400, '新密码和确认密码不一致')
        return
      }
      const { id } = ctx.state?.user
      const accountInfo: any = await prisma.account.findUnique({
        where: {
          id,
        },
      })

      if (!accountInfo) {
        ctx.fail(400, '账户不存在')
        return
      }
      if (!BCrypt.compareSync(mpParam.oldPwd, accountInfo.password)) {
        ctx.fail(400, '旧密码不正确')
        return
      }
      await prisma.account.update({
        data: {
          password: mpParam.newPwd,
        },
        where: {
          id,
        },
      })
      ctx.ok()
    } catch (error: any) {
      ctx.fail(500, error.message || '修改密码失败')
    }
  }
}
