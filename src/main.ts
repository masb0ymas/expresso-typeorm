import http from 'http'
import { initDatabase } from './app/database/connection'
import { App } from './config/app'
import { env } from './config/env'
import { storage } from './config/storage'
import { storageExists } from './lib/boolean'
import { httpHandle } from './lib/http/handle'

function bootstrap() {
  const port = env.APP_PORT
  const app = new App().create
  const server = http.createServer(app)
  const isStorageEnabled = storageExists()

  // initial database
  initDatabase()

  // initial storage
  if (isStorageEnabled) {
    storage.initialize()
  }

  // http handle
  const { onError, onListening } = httpHandle(server, port)

  // run server listen
  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
}

bootstrap()
