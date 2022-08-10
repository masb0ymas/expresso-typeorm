import 'module-alias/register'
import './pathAlias'

import initialAwsS3 from '@config/clientS3'
import { AWS_ACCESS_KEY, AWS_SECRET_KEY } from '@config/env'
import { logErrServer, logServer } from '@expresso/helpers/Formatter'
import chalk from 'chalk'
import App from './app'
import initialJobs from './jobs'
import { AppDataSource } from '@database/data-source'
import _ from 'lodash'

// const pathEnv = path.resolve('.env')

// if (!fs.existsSync(pathEnv)) {
//   throw new Error(
//     'Missing env!!!\nCopy / Duplicate ".env.example" root directory to ".env"'
//   )
// }

// // read file service account firebase
// const serviceAccountKey = path.resolve('./serviceAccountKey.json')
// console.log(logServer('Service Account Key', serviceAccountKey))

// if (!fs.existsSync(serviceAccountKey)) {
//   throw new Error(
//     'Missing serviceAccountKey!!!\nCopy serviceAccountKey from your console firebase to root directory "serviceAccountKey.json"'
//   )
// }

const Server = new App()

// connect to database
AppDataSource.initialize()
  .then((connection) => {
    const dbName = _.get(connection, 'options.database', '')
    const dbConnect = _.get(connection, 'options.type', '')

    const message = `Database ${chalk.blue(dbName)}, Connection ${chalk.cyan(
      dbConnect
    )} has been established successfully.`
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

// initial firebase admin
// admin.initializeApp({ credential: admin.credential.cert(serviceAccountKey) })

// initial firebase
// initializeApp(initialFirebase)

// initial jobs
initialJobs()
