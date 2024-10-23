import { apiReference } from '@scalar/express-api-reference'
import express, { Request, Response } from 'express'
import swaggerUI from 'swagger-ui-express'
import { AuthController } from '~/app/controller/auth.controller'
import { RoleController } from '~/app/controller/role.controller'
import { SessionController } from '~/app/controller/session.controller'
import { UploadController } from '~/app/controller/upload.controller'
import { UserController } from '~/app/controller/user.controller'
import { env } from '~/config/env'
import { optionsSwaggerUI, swaggerSpec } from '~/core/modules/getDocsSwagger'

const route = express.Router()

route.use(RoleController)
route.use(SessionController)
route.use(UploadController)
route.use(UserController)
route.use(AuthController)

function docsSwagger() {
  route.get('/swagger.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  route.use('/swagger', swaggerUI.serve)
  route.get('/swagger', swaggerUI.setup(swaggerSpec, optionsSwaggerUI))

  route.use(
    '/api-docs',
    apiReference({
      spec: {
        url: '/v1/swagger.json',
      },
    })
  )
}

// docs swagger disable for production mode
if (env.NODE_ENV !== 'production') {
  docsSwagger()
}

export { route as v1Routes }
