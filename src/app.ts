import { APP_NAME, APP_PORT, NODE_ENV } from '@config/env'
import { i18nConfig } from '@config/i18n'
import { winstonLogger, winstonStream } from '@config/logger'
import Storage from '@config/storage'
import { logServer } from '@core/helpers/formatter'
import ResponseError from '@core/modules/response/ResponseError'
import expressErrorResponse from '@middlewares/expressErrorResponses'
import { expressRateLimit } from '@middlewares/expressRateLimits'
import { expressWithState } from '@middlewares/expressWithState'
import chalk from 'chalk'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import Express, { type Application, type Request, type Response } from 'express'
import userAgent from 'express-useragent'
import helmet from 'helmet'
import hpp from 'hpp'
import http from 'http'
import i18nextMiddleware from 'i18next-http-middleware'
import logger from 'morgan'
import path from 'path'
import requestIp from 'request-ip'
import indexRoutes from './routes'

class App {
  private readonly application: Application
  private readonly port: number | string

  constructor() {
    this.application = Express()
    this.port = APP_PORT

    // enabled
    this.plugins()
    this.initialProvider()
    this.routes()
  }

  /**
   * Express Plugins
   */
  private plugins(): void {
    this.application.use(helmet())
    this.application.use(cors())
    this.application.use(logger('combined', { stream: winstonStream }))
    this.application.use(
      Express.json({ limit: '200mb', type: 'application/json' })
    )
    this.application.use(Express.urlencoded({ extended: true }))
    this.application.use(cookieParser())
    this.application.use(compression())
    this.application.use(Express.static(path.resolve(`${__dirname}/../public`)))
    this.application.use(hpp())
    this.application.use(requestIp.mw())
    this.application.use(userAgent.express())
    this.application.use(i18nextMiddleware.handle(i18nConfig))
    this.application.use(expressRateLimit())
    this.application.use(expressWithState())
  }

  /**
   * Initial Provider
   */
  private initialProvider(): void {
    const storage = new Storage('minio')

    // initial storage
    void storage.initial()
  }

  /**
   * Setup Routes
   */
  private routes(): void {
    this.application.use(indexRoutes)

    // Catch error 404 endpoint not found
    this.application.use('*', function (req: Request, _res: Response) {
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
   * Return Application Config
   * @returns
   */
  public app(): Application {
    return this.application
  }

  /**
   * Run Express App
   */
  public run(): void {
    this.application.use(expressErrorResponse)

    // Error handler
    this.application.use(function (err: any, req: Request, res: Response) {
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

    // setup port
    this.application.set('port', this.port)
    const server = http.createServer(this.application)

    const onError = (error: { syscall: string; code: string }): void => {
      if (error.syscall !== 'listen') {
        throw new Error()
      }

      const bind =
        typeof this.port === 'string'
          ? `Pipe ${this.port}`
          : `Port ${this.port}`

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`)
          process.exit(1)
          break
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`)
          process.exit(1)
          break
        default:
          throw new Error()
      }
    }

    const onListening = (): void => {
      const addr = server.address()
      const bind = typeof addr === 'string' ? `${addr}` : `${addr?.port}`

      const host = chalk.cyan(`http://localhost:${bind}`)
      const env = chalk.blue(NODE_ENV)

      const msgType = `${APP_NAME}`
      const message = `Server listening on ${host} ⚡️ & Env: ${env} 🚀`

      console.log(logServer(msgType, message))
    }

    // Run listener
    server.listen(this.port)
    server.on('error', onError)
    server.on('listening', onListening)
  }
}

export default App
