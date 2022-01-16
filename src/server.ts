import 'module-alias/register'
import 'reflect-metadata'
import './pathAlias'

import initialAwsS3 from '@config/clientS3'
import databaseConfig from '@config/database'
import { AWS_ACCESS_KEY, AWS_SECRET_KEY } from '@config/env'
import { logErrServer, logServer } from '@expresso/helpers/Formatter'
import chalk from 'chalk'
import { createConnection } from 'typeorm'
import App from './app'
import initialJobs from './jobs'

const Server = new App()

// connect to database
createConnection(databaseConfig)
  .then((connection) => {
    const dbName = chalk.blue(connection.options.database)
    const dbConnect = chalk.cyan(connection.options.type)

    const message = `Database ${dbName}, Connection ${dbConnect} has been established successfully.`
    console.log(logServer('TypeORM', message))

    Server.run()
  })
  .catch((err) => {
    const message = `Unable to connect to the database: ${err}`
    console.log(logErrServer('TypeORM Error: ', message))
  })

// check if exist access & secret key aws
if (AWS_ACCESS_KEY && AWS_SECRET_KEY) {
  // initial client s3
  void initialAwsS3()
}

// initial firebase
// const serviceAccountKey = path.resolve('./serviceAccountKey.json')

// admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) })
// firebase.initializeApp(initialFirebase)

// initial jobs
initialJobs()
