import 'module-alias/register'
import './pathAlias'

import App from './app'
import { logErrServer, logServer } from '@core/helpers/formatter'
import chalk from 'chalk'
import { AppDataSource } from '@database/data-source'
import _ from 'lodash'

const server = new App()

// connect to database
AppDataSource.initialize()
  .then((connection) => {
    const dbName = _.get(connection, 'options.database', '')
    const dbConnect = _.get(connection, 'options.type', '')

    const message = `Database ${chalk.blue(dbName)}, Connection ${chalk.cyan(
      dbConnect
    )} has been established successfully.`
    console.log(logServer('TypeORM', message))

    // Run the Express App
    server.run()
  })
  .catch((err) => {
    const message = `Unable to connect to the database: ${err}`
    console.log(logErrServer('TypeORM Error: ', message))
  })
