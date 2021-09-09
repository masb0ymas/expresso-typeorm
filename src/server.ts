/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-var-requires */
require('@babel/register')({ extensions: ['.js', '.ts'] })

import 'reflect-metadata'
import { createConnection } from 'typeorm'
import App from './app'

const Server = new App()

// connect to database
createConnection()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })

Server.run()
