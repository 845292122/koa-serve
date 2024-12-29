import { Context } from 'koa'

/**
 * 请求参数异常
 */
class BadRequesetError extends Error {
  public status: number
  public message: string

  constructor(message: string) {
    super(message)
    this.status = 400
    this.message = message
  }
}

function parseAndThrowZodError(ctx: Context) {
  if (ctx.invalid.error && ctx.invalid.body) {
    const errArr: Array<any> = JSON.parse(ctx.invalid.body)
    const errMsg = errArr.map(err => err.message).join(',')
    throw new BadRequesetError(errMsg)
  }
}

export { BadRequesetError, parseAndThrowZodError }
