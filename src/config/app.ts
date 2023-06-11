import chalk from 'chalk'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Application, type Request, type Response } from 'express'
import userAgent from 'express-useragent'
import { printLog } from 'expresso-core'
import helmet from 'helmet'
import hpp from 'hpp'
import i18nextMiddleware from 'i18next-http-middleware'
import _ from 'lodash'
import logger from 'morgan'
import path from 'path'
import requestIp from 'request-ip'
import swaggerUI from 'swagger-ui-express'
import expressErrorResponse from '~/app/middleware/expressErrorResponse'
import expressErrorTypeORM from '~/app/middleware/expressErrorTypeORM'
import expressErrorYup from '~/app/middleware/expressErrorYups'
import { expressRateLimit } from '~/app/middleware/expressRateLimit'
import { expressUserAgent } from '~/app/middleware/expressUserAgent'
import { expressWithState } from '~/app/middleware/expressWithState'
import { optionsSwaggerUI, swaggerSpec } from '~/core/modules/docsSwagger'
import ResponseError from '~/core/modules/response/ResponseError'
import { AppDataSource } from '~/database/data-source'
import indexRoutes from '../routes'
import { corsOptions } from './cors'
import { env } from './env'
import { i18n } from './i18n'
import { winstonLogger, winstonStream } from './logger'
import { mailService } from './mail'
import { storageService } from './storage'
import { Jobs } from '~/app/job'

/**
 * Initialize Bootsrap Application
 */
export class App {
  private readonly _app: Application
  private readonly _port: number | string

  constructor() {
    this._app = express()
    this._port = env.APP_PORT

    this._plugins()
    this._provider()
    this._database()

    // docs swagger disable for production mode
    if (env.NODE_ENV !== 'production') {
      this._swagger()
    }

    this._routes()
  }

  /**
   * Initialize Plugins
   */
  private _plugins(): void {
    this._app.use(helmet())
    this._app.use(cors(corsOptions))

    this._app.use(logger('combined', { stream: winstonStream }))
    this._app.use(express.json({ limit: '200mb', type: 'application/json' }))
    this._app.use(express.urlencoded({ extended: true }))
    this._app.use(express.static(path.resolve(`${__dirname}/../../public`)))
    this._app.use(cookieParser())
    this._app.use(compression())
    this._app.use(hpp())
    this._app.use(requestIp.mw())
    this._app.use(userAgent.express())
    this._app.use(i18nextMiddleware.handle(i18n))

    // middleware
    this._app.use(expressRateLimit())
    this._app.use(expressWithState())
    this._app.use(expressUserAgent())
  }

  /**
   * Initialize Provider
   */
  private _provider(): void {
    // storage
    void storageService.initialize()

    // mail
    if (env.MAIL_USERNAME && env.MAIL_PASSWORD) {
      mailService.initialize()
    }

    // cron job
    Jobs.initialize()
  }

  /**
   * Initialize Swagger
   */
  private _swagger(): void {
    this._app.get('/v1/api-docs.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(swaggerSpec)
    })

    this._app.use('/v1/api-docs', swaggerUI.serve)
    this._app.get(
      '/v1/api-docs',
      swaggerUI.setup(swaggerSpec, optionsSwaggerUI)
    )
  }

  /**
   * Initialize Routes
   */
  private _routes(): void {
    this._app.use(indexRoutes)

    // Catch error 404 endpoint not found
    this._app.use('*', function (req: Request, _res: Response) {
      const method = req.method
      const url = req.originalUrl
      const host = req.hostname

      const endpoint = `${host}${url}`

      throw new ResponseError.NotFound(
        `Sorry, the ${endpoint} HTTP method ${method} resource you are looking for was not found.`
      )
    })
  }

  /**
   * Return this Application Bootstrap
   * @returns
   */
  public app(): Application {
    return this._app
  }

  /**
   * Initialize Database
   */
  private _database(): void {
    // connect to database
    AppDataSource.initialize()
      .then((connection) => {
        const dbName = _.get(connection, 'options.database', '')
        const dbConnect = _.get(connection, 'options.type', '')

        const msgType = 'TypeORM'
        const message = `Database ${chalk.blue(
          dbName
        )}, Connection ${chalk.cyan(
          dbConnect
        )} has been established successfully.`

        const logMessage = printLog(msgType, message)
        console.log(logMessage)
      })
      .catch((err) => {
        const msgType = 'TypeORM - Error :'
        const message = `Unable to connect to the database: ${err}`

        const logMessage = printLog(msgType, message, { label: 'error' })
        console.log(logMessage)
      })
  }

  /**
   * Create Bootstrap App
   */
  public create(): Application {
    this._app.use(expressErrorYup)
    this._app.use(expressErrorTypeORM)
    this._app.use(expressErrorResponse)

    // error handler
    this._app.use(function (err: any, req: Request, res: Response) {
      // Set locals, only providing error in development
      res.locals.message = err.message
      res.locals.error = req.app.get('env') === 'development' ? err : {}

      // Add this line to include winston logging
      winstonLogger.error(
        `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
          req.method
        } - ${req.ip}`
      )

      // Render the error page
      res.status(err.status || 500)
      res.render('error')
    })

    // set port
    this._app.set('port', this._port)

    // return this application
    return this.app()
  }
}
