import zodRouter from 'koa-zod-router'
import { UserRoute } from './system/user.route'
import { RoleRoute } from './system/role.route'
import { TenantRoute } from './system/tenant.route'
import { PermissionRoute } from './system/permission.route'

const router = zodRouter()

// * 系统模块
UserRoute(router)
RoleRoute(router)
TenantRoute(router)
PermissionRoute(router)

export default router
