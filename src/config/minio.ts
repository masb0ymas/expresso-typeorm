import { logErrServer, logServer } from '@expresso/helpers/Formatter'
import chalk from 'chalk'
import { addDays } from 'date-fns'
import * as Minio from 'minio'
import ms from 'ms'
import {
  MINIO_ACCESS_KEY,
  MINIO_BUCKET_NAME,
  MINIO_HOST,
  MINIO_REGION,
  MINIO_S3_EXPIRED,
  MINIO_SECRET_KEY,
  NODE_ENV,
} from './env'

export const minioClient = new Minio.Client({
  endPoint: MINIO_HOST,
  port: 9000,
  accessKey: String(MINIO_ACCESS_KEY),
  secretKey: String(MINIO_SECRET_KEY),
  region: MINIO_REGION,
  useSSL: NODE_ENV !== 'development',
})

const bucketName = chalk.cyan(MINIO_BUCKET_NAME)

/**
 * Create Bucket MinIO
 */
function createBucket(): void {
  minioClient.makeBucket(MINIO_BUCKET_NAME, MINIO_REGION, function (err) {
    const msgType = `S3 MinIO`

    if (err) {
      console.log(logErrServer(`${msgType} Error:`, err.message))
      process.exit(1)
    } else {
      const message = `Success create bucket: ${bucketName}`
      console.log(logServer(msgType, message))
    }
  })
}

/**
 * Initial MinIO
 */
export const initialMinIO = async (): Promise<void> => {
  const msgType = `S3 MinIO`

  const exist = await minioClient.bucketExists(MINIO_BUCKET_NAME)

  if (exist) {
    // initial bucket
    const message = `Success Get Bucket: ${bucketName}`
    console.log(logServer(msgType, message), { exist })
  } else {
    // create bucket if doesn't exist
    createBucket()
  }
}

const getNumberExpires = MINIO_S3_EXPIRED.replace(/[^0-9]/g, '')

// S3 Object Expired ( 7 days )
export const minioObjectExpired = ms(MINIO_S3_EXPIRED) / 1000

// S3 Expires in 7 days
export const minioExpiresDate = addDays(new Date(), Number(getNumberExpires))
