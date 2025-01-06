import zodRouter from 'koa-zod-router'
import { AccountRoute } from './account.route'
import { PermRoute } from './perm.route'

const router = zodRouter()

// * 系统模块
AccountRoute(router)
PermRoute(router)

export default router
