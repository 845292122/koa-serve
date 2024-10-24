import Router from 'koa-router'
import { permMiddleware } from '../middleware/perm'
import { Context } from 'koa'
import { prisma, extractErrorMessage } from '../helper'
import { z } from 'zod'

const router = new Router({ prefix: '/account' })

// router.get('/list', permMiddleware, AccountApi.getAccountList)
// router.get('/:id', permMiddleware, AccountApi.getAccountInfo)
// router.post('/', permMiddleware, AccountApi.createAccount)
// router.put('/', permMiddleware, AccountApi.modifyAccount)
// router.delete('/:id', permMiddleware, AccountApi.removeAccount)
// router.post('/mp', AccountApi.modifyPwd)


router.get('/test', async (ctx: Context) => {
  const queryParam = ctx.query
  const schema = z.object({
    pageSize: z.number().min(1, { message: '每页最少显示1条'}).max(100, {message: '每页最多不超过100条'}).default(10),
    pageNo: z.number().default(1)
  })

  try {
    const validSchema = await schema.safeParseAsync(queryParam)
    if (!validSchema.success) {
      const errMsg = extractErrorMessage(validSchema.error.message)
      ctx.fail(400, errMsg)
      return
    }
  }
})

export default router
