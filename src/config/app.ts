import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import userAgent from 'express-useragent'
import helmet from 'helmet'
import hpp from 'hpp'
import * as i18nextMiddleware from 'i18next-http-middleware'
import path from 'path'
import requestIp from 'request-ip'
import Jobs from '~/app/job'
import expressErrorResponse from '~/app/middleware/expressErrorResponse'
import expressErrorTypeorm from '~/app/middleware/expressErrorTypeorm'
import expressErrorZod from '~/app/middleware/expressErrorZod'
import expressRateLimit from '~/app/middleware/expressRateLimit'
import expressUserAgent from '~/app/middleware/expressUserAgent'
import expressWithState from '~/app/middleware/expressWithState'
import ErrorResponse from '~/core/modules/response/ErrorResponse'
import { storageExists } from '~/core/utils/boolean'
import { __dirname } from '~/core/utils/file'
import { Routes } from '~/routes'
import { corsOptions } from './cors'
import { env } from './env'
import { i18n } from './i18n'
import { mailService } from './mail'
import { httpLogger } from './pino'
import { storageService } from './storage'

export class App {
  private _app: Application

  constructor() {
    this._app = express()

    this._plugins()
    this._provider()
    this._routes()
  }

  private _plugins() {
    this._app.use(
      helmet({
        contentSecurityPolicy: false,
        xDownloadOptions: false,
      })
    )
    this._app.use(cors(corsOptions))
    this._app.use(httpLogger())
    this._app.use(compression())
    this._app.use(cookieParser())
    this._app.use(express.json({ limit: '200mb', type: 'application/json' }))
    this._app.use(express.urlencoded({ extended: true }))
    this._app.use(express.static(path.resolve(`${__dirname}/public`)))
    this._app.use(hpp())
    this._app.use(requestIp.mw())
    this._app.use(userAgent.express())
    this._app.use(i18nextMiddleware.handle(i18n))

    // middleware
    this._app.use(expressRateLimit())
    this._app.use(expressWithState())
    this._app.use(expressUserAgent())
  }

  private _provider() {
    const storage_exists = storageExists()

    // storage
    if (storage_exists) {
      void storageService.initialize()
    }

    if (env.MAIL_USERNAME && env.MAIL_PASSWORD) {
      mailService.initialize()
    }

    // cron job
    Jobs.initialize()
  }

  private _routes() {
    this._app.use(Routes)

    // Catch error 404 endpoint not found
    this._app.use('*', (req: Request, _res: Response) => {
      const method = req.method
      const url = req.originalUrl
      const host = req.hostname

      const endpoint = `${host}${url}`

      throw new ErrorResponse.NotFound(
        `Sorry, the ${endpoint} HTTP method ${method} resource you are looking for was not found.`
      )
    })
  }

  public create() {
    this._app.use(expressErrorZod)
    this._app.use(expressErrorTypeorm)

    // @ts-expect-error
    this._app.use(expressErrorResponse)

    return this._app
  }
}
