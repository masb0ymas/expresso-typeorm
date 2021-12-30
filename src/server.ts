import 'module-alias/register'
import './pathAlias'
import 'reflect-metadata'

import initialAwsS3 from '@config/clientS3'
import databaseConfig from '@config/database'
import { AWS_ACCESS_KEY, AWS_SECRET_KEY } from '@config/env'
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
    console.log(
      `Database ${dbName}, Connection ${dbConnect} has been established successfully.`
    )

    Server.run()
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
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
