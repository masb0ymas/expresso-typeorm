import 'module-alias/register'
import './pathAlias'

import 'reflect-metadata'
import dbConfig from './config/Database'
import { createConnection } from 'typeorm'
import App from './app'

const Server = new App()

// connect to database
createConnection(dbConfig)
  .then((connection) => {
    console.log('Connection has been established successfully.')
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })

Server.run()
