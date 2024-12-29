import zodRouter from 'koa-zod-router'
import { accountRoutes } from './account.route'
import { authRoutes } from './auth.route'

const router = zodRouter()

// 注册账号路由
accountRoutes(router)
authRoutes(router)

export default router
