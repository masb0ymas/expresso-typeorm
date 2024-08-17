import express from 'express'
import { AuthController } from '~/app/controller/auth.controller'
import { RoleController } from '~/app/controller/role.controller'
import { SessionController } from '~/app/controller/session.controller'
import { UploadController } from '~/app/controller/upload.controller'
import { UserController } from '~/app/controller/user.controller'

const route = express.Router()

route.use(RoleController)
route.use(SessionController)
route.use(UploadController)
route.use(UserController)
route.use(AuthController)

export { route as v1Routes }
