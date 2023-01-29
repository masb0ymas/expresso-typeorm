import {
  GetBucketAclCommand,
  GetBucketAclCommandOutput,
  S3,
} from '@aws-sdk/client-s3'
import { logErrServer, logServer } from '@expresso/helpers/Formatter'
import chalk from 'chalk'
import { addDays } from 'date-fns'
import ms from 'ms'
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_S3_EXPIRED,
  AWS_SECRET_KEY,
} from './env'

export const clientS3 = new S3({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
  region: AWS_REGION,
})

const bucketName = chalk.cyan(AWS_BUCKET_NAME)

/**
 * Create Bucket S3
 */
function createBucket(): void {
  // s3 create bucket
  clientS3.createBucket({ Bucket: AWS_BUCKET_NAME }, function (err, data) {
    const msgType = `Aws S3`

    if (err) {
      console.log(logErrServer(`${msgType} - Error:`, err))
      process.exit(1)
    } else {
      const message = `Success create bucket: ${bucketName}`
      console.log(logServer(msgType, message), data?.Location)
    }
  })
}

/**
 * Initial Aws S3
 * @returns
 */
export const initialAwsS3 = async (): Promise<
  GetBucketAclCommandOutput | undefined
> => {
  const msgType = `Aws S3`

  try {
    // initial bucket
    const data = await clientS3.send(
      new GetBucketAclCommand({ Bucket: AWS_BUCKET_NAME })
    )

    const message = `Success Get Bucket: ${bucketName}`
    console.log(logServer(msgType, message), data.Grants)

    return data
  } catch (err) {
    const message = `${err}`
    console.log(logErrServer(`${msgType} - Error:`, message))

    // create bucket if doesn't exist
    createBucket()
    // s3 create bucket
  }
}

const getNumberExpires = AWS_S3_EXPIRED.replace(/[^0-9]/g, '')

// S3 Object Expired ( 7 days )
export const s3ObjectExpired = ms(AWS_S3_EXPIRED) / 1000

// S3 Expires in 7 days
export const s3ExpiresDate = addDays(new Date(), Number(getNumberExpires))
