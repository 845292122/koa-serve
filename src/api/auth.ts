import { PrismaClient } from '@prisma/client'
import BCrypt from 'bcryptjs'
import Jwt from 'jsonwebtoken'
import { Context } from 'koa'
import { z } from 'zod'
import { JWT_SECRET } from '../core/constant'
import { extractErrorMessage } from '../helper'
import { AuthType } from '../types'

const prisma = new PrismaClient()

export default class AuthApi {
  /**
   * login
   */
  public static async login(ctx: Context) {
    const loginParam: AuthType.LoginInfo = ctx.request.body
    const schema = z.object({
      phone: z.string({ message: '手机号不能为空' }).regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' }),
      password: z.string({ message: '密码不能为空' }),
    })

    try {
      const validRes = await schema.safeParseAsync(loginParam)
      if (!validRes.success) {
        const errMsg = extractErrorMessage(validRes.error.message)
        ctx.fail(400, errMsg)
        return
      }
      const account: any = await prisma.account.findUnique({
        where: {
          phone: loginParam.phone,
        },
      })
      if (!account) {
        ctx.fail(400, '手机号或密码不正确')
        return
      }
      if (!BCrypt.compareSync(loginParam.password, account.password)) {
        ctx.fail(400, '手机号或密码不正确')
        return
      }

      const payload = {
        id: account.id,
        phone: account.phone,
        isAdmin: account.isAdmin,
      }
      const token = Jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
      ctx.ok(token)
    } catch (error: any) {
      ctx.fail(500, error.message || '登录失败, 请稍后再试')
    }
  }

  /**
   * 获取认证信息
   */
  public static async getAuthInfo(ctx: Context) {
    const { id } = ctx.state?.user
    try {
      const authInfo: any = await prisma.account.findUnique({
        where: {
          id,
        },
      })
      delete authInfo?.password
      ctx.ok(authInfo)
    } catch (error: any) {
      ctx.fail(500, error.message || '获取认证信息失败')
    }
  }
}
