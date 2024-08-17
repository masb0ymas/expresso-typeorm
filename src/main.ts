import 'reflect-metadata'
import { blue, green } from 'colorette'
import { logger } from 'expresso-core'
import http from 'http'
import _ from 'lodash'
import { App } from './config/app'
import { env } from './config/env'
import { httpHandle } from './core/modules/http/handle'
import { AppDataSource } from './database/datasource'

async function bootstrap() {
  const port = env.APP_PORT
  const app = new App().create()

  const server = http.createServer(app)

  // connect to database
  const msgType = green('typeorm')

  try {
    const connection = await AppDataSource.initialize()

    const dbName = blue(`${_.get(connection, 'options.database', '')}`)
    const dbConnect = blue(`${_.get(connection, 'options.type', '')}`)

    const message = `database ${dbName}, connection ${dbConnect} has been established successfully.`
    logger.info(`${msgType} - ${message}`)

    // http handle
    const { onError, onListening } = httpHandle(server, port)

    // run server listen
    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)
  } catch (error) {
    const message = `unable to connect to the database: ${error}`
    logger.error(`${msgType} - err, ${message}`)
    process.exit(1)
  }
}

bootstrap()
