import Router from 'koa-router'
import AuthApi from '../api/auth'

const router = new Router({ prefix: '/auth' })

router.post('/login', AuthApi.login)
router.get('/info', AuthApi.getAuthInfo)
export default router
