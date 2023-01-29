import 'module-alias/register'
import './pathAlias'

import { initialAwsS3 } from '@config/clientS3'
import {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  GCP_PROJECT_ID,
  GCS_BUCKET_NAME,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
} from '@config/env'
import { initialGCS } from '@config/googleCloudStorage'
import { initialMinIO } from '@config/minio'
import { AppDataSource } from '@database/data-source'
import { logErrServer, logServer } from '@expresso/helpers/Formatter'
import chalk from 'chalk'
import _ from 'lodash'
import App from './app'
import initialJobs from './jobs'

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

// check if exist access & secret key aws s3
if (AWS_ACCESS_KEY && AWS_SECRET_KEY) {
  // initial client s3
  void initialAwsS3()
}

// check if exist gcp project id & bucket
if (GCP_PROJECT_ID && GCS_BUCKET_NAME) {
  // initial google cloud storage
  void initialGCS()
}

// check if exist minio s3
if (MINIO_ACCESS_KEY && MINIO_SECRET_KEY) {
  void initialMinIO()
}

// initial jobs
initialJobs()
