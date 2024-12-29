import { Context } from 'koa'

export const checkTokenRevoked = async (ctx: Context, decodedToken: object, token: string): Promise<boolean> => {
  // TODO: jwt二次验证逻辑, 根据ip进行验证
  return false
}
