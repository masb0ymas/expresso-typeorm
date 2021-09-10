import winstonLogger, { winstonStream } from '@config/Logger'
import ResponseError from '@expresso/modules/Response/ResponseError'
import ExpressErrorResponse from '@middlewares/ExpressErrorResponse'
import ExpressErrorYup from '@middlewares/ExpressErrorYup'
import ExpressRateLimit from '@middlewares/ExpressRateLimit'
import Routes from '@routes/index'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import Cors from 'cors'
import Express, { Application, Request, Response } from 'express'
import UserAgent from 'express-useragent'
import Helmet from 'helmet'
import hpp from 'hpp'
import Logger from 'morgan'
import path from 'path'

class App {
  private readonly application: Application
  private readonly port: number | string

  constructor() {
    this.port = Number(process.env.PORT) || 8000
    this.application = Express()
    this.plugins()
    this.routes()
  }

  private plugins(): void {
    this.application.use(Helmet())
    this.application.use(Cors())
    this.application.use(Logger('combined', { stream: winstonStream }))
    this.application.use(Express.urlencoded({ extended: true }))
    this.application.use(
      Express.json({ limit: '200mb', type: 'application/json' })
    )
    this.application.use(cookieParser())
    this.application.use(compression())
    this.application.use(Express.static(path.resolve(`${__dirname}/../public`)))
    this.application.use(hpp())
    this.application.use(UserAgent.express())
    this.application.use(ExpressRateLimit)
  }

  private routes(): void {
    this.application.use(Routes)

    // Catch error 404 endpoint not found
    this.application.use('*', function (req: Request, res: Response) {
      throw new ResponseError.NotFound(
        `Sorry, endpoint: ${req.url} HTTP resource you are looking for was not found.`
      )
    })
  }

  public run(): void {
    this.application.use(ExpressErrorYup)
    this.application.use(ExpressErrorResponse)

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

    // Run listener
    this.application.listen(this.port, () => {
      console.log(`Server listening on http://localhost:${this.port}`)
    })
  }
}

export default App
