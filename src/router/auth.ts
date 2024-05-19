import Router from 'koa-router'
import AuthApi from '../api/auth'

const routera = new Router({ prefix: '/auth' })

routera.post('/login', AuthApi.login)
routera.get('/info', AuthApi.getAuthInfo)
export default routera
