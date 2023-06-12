import http from 'http'
import { env } from './config/env'
import { App } from './config/app'
import { httpHandle } from './core/modules/http/handle'

function bootstrap(): void {
  const port = env.APP_PORT

  const app = new App().create()
  const server = http.createServer(app)

  const { onError, onListening } = httpHandle(server, port)

  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
}

bootstrap()
