import 'module-alias/register'
import './pathAlias'

import { AppDataSource } from '@database/data-source'
import chalk from 'chalk'
import { printLog } from 'expresso-core'
import _ from 'lodash'
import App from './app'

const server = new App()

// connect to database
AppDataSource.initialize()
  .then((connection) => {
    const dbName = _.get(connection, 'options.database', '')
    const dbConnect = _.get(connection, 'options.type', '')

    const msgType = 'TypeORM'
    const message = `Database ${chalk.blue(dbName)}, Connection ${chalk.cyan(
      dbConnect
    )} has been established successfully.`

    const logMessage = printLog(msgType, message)

    console.log(logMessage)

    // Run the Express App
    server.run()
  })
  .catch((err) => {
    const msgType = 'TypeORM - Error :'
    const message = `Unable to connect to the database: ${err}`

    const logMessage = printLog(msgType, message, { label: 'error' })

    console.log(logMessage)
  })
