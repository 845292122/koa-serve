import zodRouter from 'koa-zod-router'
import { UserRoute } from './system/user.route'

const router = zodRouter()

// * 系统模块
UserRoute(router)

export default router
