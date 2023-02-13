import { GetBucketAclCommand, S3 } from '@aws-sdk/client-s3'
import { logErrServer, logServer } from '@core/helpers/formatter'
import { Storage as GoogleCloudStorage } from '@google-cloud/storage'
import chalk from 'chalk'
import { addDays } from 'date-fns'
import fs from 'fs'
import * as Minio from 'minio'
import ms from 'ms'
import path from 'path'
import {
  STORAGE_ACCESS_KEY,
  STORAGE_BUCKET_NAME,
  STORAGE_REGION,
  STORAGE_SECRET_KEY,
  STORAGE_SIGN_EXPIRED,
} from './env'

interface DtoExpiresObject {
  expires: number
  expiryDate: Date
}

class Storage {
  private readonly type: string
  private readonly _clientS3: S3 | undefined
  private readonly _clientMinio: Minio.Client | undefined
  private readonly _clientGCS: GoogleCloudStorage | undefined

  constructor(value: string) {
    // check storage type
    this.type = value

    // config client Aws S3
    if (this.type === 's3') {
      this._clientS3 = new S3({
        credentials: {
          accessKeyId: String(STORAGE_ACCESS_KEY),
          secretAccessKey: String(STORAGE_SECRET_KEY),
        },
        region: STORAGE_REGION,
      })
    }

    // config client Minio
    if (this.type === 'minio') {
      this._clientMinio = new Minio.Client({
        endPoint: '127.0.0.1',
        port: 9000,
        accessKey: String(STORAGE_ACCESS_KEY),
        secretKey: String(STORAGE_SECRET_KEY),
        region: STORAGE_REGION,
        useSSL: false,
      })
    }

    // config client Google Cloud Storage
    if (this.type === 'gcs') {
      const msgType = 'Google Cloud Storage'
      const projectId = String(STORAGE_ACCESS_KEY)

      const serviceAccountKey = path.resolve('./gcp-serviceAccount.json')

      if (!projectId && !fs.existsSync(serviceAccountKey)) {
        console.log(logErrServer(msgType, 'is missing on root directory'))

        throw new Error(
          'Missing GCP Service Account!!!\nCopy gcp-serviceAccount from your console google to root directory "gcp-serviceAccount.json"'
        )
      }

      if (projectId) {
        console.log(logServer(msgType, serviceAccountKey))
      }

      this._clientGCS = new GoogleCloudStorage({
        projectId,
        keyFilename: serviceAccountKey,
      })
    }
  }

  /**
   * Expires Object Storage Sign
   * @returns
   */
  public expiresObject(): DtoExpiresObject {
    const getExpired = STORAGE_SIGN_EXPIRED.replace(/[^0-9]/g, '')

    const expires = ms(getExpired) / 1000
    const expiryDate = addDays(new Date(), Number(getExpired))

    return { expires, expiryDate }
  }

  /**
   * ```sh
   * Using a client with a Cloud Storage Provider
   * ```
   * @name
   * Using the client with the AWS S3 Provider
   * @example
   * import { S3 } from '@aws-sdk/client-s3'
   *
   * const storage = new Storage('s3')
   * const s3 = storage.client<S3>().getObject()
   *
   * @name
   * Using the client with the Minio Provider
   * @example
   * import * as Minio from 'minio'
   *
   * const storage = new Storage('minio')
   * const minio = storage.client<Minio.Client>().fGetObject()
   *
   * @name
   * Using the client with the Google Cloud Storage Provider
   * @example
   * import { Storage as GoogleCloudStorage } from '@google-cloud/storage'
   *
   * const storage = new Storage('gcs')
   * const gcs = storage.client<GoogleCloudStorage>().getProjectId()
   *
   * @returns
   */
  public client<T>(): T | undefined {
    if (this.type === 's3') {
      // @ts-expect-error: Unreachable code error
      return this._clientS3
    }

    if (this.type === 'minio') {
      // @ts-expect-error: Unreachable code error
      return this._clientMinio
    }

    if (this.type === 'gcs') {
      // @ts-expect-error: Unreachable code error
      return this._clientGCS
    }
  }

  /**
   * Create S3 Bucket
   */
  private async _createS3Bucket(): Promise<void> {
    const msgType = 'S3'
    const bucketName = STORAGE_BUCKET_NAME

    try {
      const data = await this._clientS3?.createBucket({
        Bucket: bucketName,
      })

      const message = `Success Create Bucket: ${chalk.cyan(bucketName)}`
      console.log(logServer(msgType, message), data)
    } catch (err: any) {
      console.log(logErrServer(`${msgType} - Error :`, err?.message ?? err))
      process.exit()
    }
  }

  /**
   * Initial Aws S3
   */
  private async _initialS3(): Promise<any> {
    const msgType = 'S3'
    const bucketName = STORAGE_BUCKET_NAME

    try {
      const data = await this._clientS3?.send(
        new GetBucketAclCommand({ Bucket: bucketName })
      )

      const message = `Success Get Bucket: ${chalk.cyan(bucketName)}`
      console.log(logServer(msgType, message), data?.Grants)
    } catch (err: any) {
      console.log(logErrServer(`${msgType} Error :`, err?.message ?? err))

      await this._createS3Bucket()
    }
  }

  /**
   * Create Minio Bucket
   */
  private async _createMinioBucket(): Promise<void> {
    const msgType = 'Minio'
    const bucketName = STORAGE_BUCKET_NAME

    try {
      await this._clientMinio?.makeBucket(bucketName, STORAGE_REGION)

      const message = `Success Create Bucket: ${chalk.cyan(bucketName)}`
      console.log(logServer(msgType, message))
    } catch (err: any) {
      console.log(logErrServer(`${msgType} Error:`, err?.message ?? err))
      process.exit()
    }
  }

  /**
   * Initial Minio
   */
  private async _initialMinio(): Promise<void> {
    const msgType = 'Minio'
    const bucketName = STORAGE_BUCKET_NAME

    const exists = await this._clientMinio?.bucketExists(bucketName)

    if (!exists) {
      await this._createMinioBucket()
    } else {
      const message = `Success Get Bucket: ${chalk.cyan(bucketName)}`
      console.log(logServer(msgType, message))
    }
  }

  /**
   * Create Google Cloud Storage Bucket
   */
  private async _createGCSBucket(): Promise<void> {
    const msgType = 'Google Cloud Storage'
    const bucketName = STORAGE_BUCKET_NAME

    try {
      const data = await this._clientGCS?.createBucket(bucketName)
      const message = `Success Create Bucket: ${chalk.cyan(bucketName)}`

      console.log(logServer(msgType, message), data)
    } catch (err: any) {
      console.log(logErrServer(`${msgType} Error :`, err?.message ?? err))
      process.exit()
    }
  }

  /**
   * Initial Google Cloud Storage
   */
  private async _initialGCS(): Promise<void> {
    const msgType = 'Google Cloud Storage'
    const bucketName = STORAGE_BUCKET_NAME

    try {
      const data = this._clientGCS?.bucket(bucketName)
      const getBucket = await data?.exists()
      const getMetadata = await data?.getMetadata()

      if (getBucket?.[0]) {
        const message = `Success Get Bucket: ${chalk.cyan(bucketName)}`
        console.log(logServer(msgType, message), getMetadata?.[0])
      }
    } catch (err: any) {
      console.log(logErrServer(`${msgType} Error :`, err?.message ?? err))

      await this._createGCSBucket()
    }
  }

  public async initial(): Promise<void> {
    if (this.type === 's3') {
      await this._initialS3()
    }

    if (this.type === 'minio') {
      await this._initialMinio()
    }

    if (this.type === 'gcs') {
      await this._initialGCS()
    }
  }
}

export default Storage
