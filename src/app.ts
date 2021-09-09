import ResponseError from '@expresso/modules/Response/ResponseError'
import compression from 'compression'
import winstonLogger, { winstonStream } from 'config/Logger'
import Cors from 'cors'
import Express, { Application, Request, Response } from 'express'
import Helmet from 'helmet'
import hpp from 'hpp'
import ExpressErrorResponse from 'middlewares/ExpressErrorResponse'
import Logger from 'morgan'
import path from 'path'
import Routes from 'routes'

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
    this.application.use(Express.json())
    this.application.use(Express.static(path.resolve(`${__dirname}/../public`)))
    this.application.use(hpp())
    this.application.use(compression())
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
    this.application.use(ExpressErrorResponse)

    // Error handler
    this.application.use(function (err: any, req: Request, res: Response) {
      // Set locals, only providing error in development
      res.locals.message = err.message
      res.locals.error = req.app.get('env') === 'development' ? err : {}

      // Add this line to include winston logging
      winstonLogger.error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
