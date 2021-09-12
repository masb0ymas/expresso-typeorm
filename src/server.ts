import 'module-alias/register'
import './pathAlias'

import 'reflect-metadata'
import dbConfig from './config/Database'
import { createConnection } from 'typeorm'
import chalk from 'chalk'
import App from './app'

const Server = new App()

// connect to database
createConnection(dbConfig)
  .then((connection) => {
    const db = chalk.blue(connection.options.database)
    const dbConnect = chalk.cyan(connection.options.type)
    console.log(
      `Database ${db}, Connection ${dbConnect} has been established successfully.`
    )
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })

Server.run()
