import express from 'express'
import { RoleController } from '~/app/controller/role.controller'
import { SessionController } from '~/app/controller/session.controller'

const route = express.Router()

route.use(RoleController)
route.use(SessionController)

export { route as v1Routes }
