import Router from 'koa-router'
import AccountApi from '../api/account'
import { permMiddleware } from '../middleware/perm'

const routera = new Router({ prefix: '/account' })

routera.get('/list', permMiddleware, AccountApi.getAccountList)
routera.get('/:id', permMiddleware, AccountApi.getAccountInfo)
routera.post('/', permMiddleware, AccountApi.createAccount)
routera.put('/', permMiddleware, AccountApi.modifyAccount)
routera.delete('/:id', permMiddleware, AccountApi.removeAccount)
routera.post('/mp', AccountApi.modifyPwd)

export default routera
