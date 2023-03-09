import {
  GetBucketAclCommand,
  GetObjectCommand,
  PutObjectCommand,
  type PutObjectCommandOutput,
  S3,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logErrServer, logServer, ms } from '@core/helpers/formatter'
import { type FileAttributes } from '@core/interface/File'
import {
  type GetSignedUrlConfig,
  Storage as GoogleCloudStorage,
  type UploadOptions,
  type UploadResponse,
} from '@google-cloud/storage'
import chalk from 'chalk'
import { addDays } from 'date-fns'
import fs from 'fs'
import * as Minio from 'minio'
import path from 'path'
import {
  STORAGE_ACCESS_KEY,
  STORAGE_BUCKET_NAME,
  STORAGE_REGION,
  STORAGE_SECRET_KEY,
  STORAGE_SIGN_EXPIRED,
} from './env'

interface DtoExpiresObject {
  expiresIn: number
  expiryDate: Date
}

class StorageProvider {
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

    const expiresIn = ms(STORAGE_SIGN_EXPIRED)
    const expiryDate = addDays(new Date(), Number(getExpired))

    return { expiresIn, expiryDate }
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

  /**
   * Get Presigned URL from AWS S3
   * @param keyFile
   * @returns
   */
  private async _getPresignedURLS3(keyFile: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: STORAGE_BUCKET_NAME,
      Key: keyFile,
    })

    const { expiresIn } = this.expiresObject()
    const newExpiresIn = expiresIn / 1000

    // @ts-expect-error: Unreachable code error
    const signedURL = await getSignedUrl(this._clientS3, command, {
      expiresIn: newExpiresIn,
    })

    return signedURL
  }

  /**
   * Get Presigned URL from MinIO
   * @param keyFile
   * @returns
   */
  private async _getPresignedURLMinIO(keyFile: string): Promise<string> {
    const signedURL = await this._clientMinio?.presignedGetObject(
      STORAGE_BUCKET_NAME,
      keyFile
    )

    return String(signedURL)
  }

  /**
   * Get Presigned URL from Google Cloud Storage
   * @param keyFile
   * @returns
   */
  private async _getPresignedURLGCS(keyFile: string): Promise<string> {
    const { expiresIn } = this.expiresObject()

    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      virtualHostedStyle: true,
      expires: Date.now() + expiresIn,
    }

    // signed url from bucket google cloud storage
    const data = await this._clientGCS
      ?.bucket(STORAGE_BUCKET_NAME)
      .file(keyFile)
      .getSignedUrl(options)

    const signedURL = String(data?.[0])

    return signedURL
  }

  /**
   * Get Presigned URL
   * @param keyFile
   * @returns
   */
  public async getPresignedURL(keyFile: string): Promise<string> {
    let signedURL: string = ''

    if (this.type === 's3') {
      signedURL = await this._getPresignedURLS3(keyFile)
    }

    if (this.type === 'minio') {
      signedURL = await this._getPresignedURLMinIO(keyFile)
    }

    if (this.type === 'gcs') {
      signedURL = await this._getPresignedURLGCS(keyFile)
    }

    return signedURL
  }

  /**
   * Upload File from AWS S3
   * @param fieldUpload
   * @param directory
   * @returns
   */
  private async _uploadFileS3(
    fieldUpload: FileAttributes,
    directory: string
  ): Promise<{
    data: PutObjectCommandOutput | undefined
    signedURL: string
  }> {
    const keyFile = `${directory}/${fieldUpload.filename}`

    // send file upload to AWS S3
    const data = await this._clientS3?.send(
      new PutObjectCommand({
        Bucket: STORAGE_BUCKET_NAME,
        Key: keyFile,
        Body: fs.createReadStream(fieldUpload.path),
        ContentType: fieldUpload.mimetype, // <-- this is what you need!
        ContentDisposition: `inline; filename=${fieldUpload.filename}`, // <-- and this !
        ACL: 'public-read', // <-- this makes it public so people can see it
      })
    )

    const signedURL = await this.getPresignedURL(keyFile)
    const result = { data, signedURL }

    return result
  }

  /**
   * Upload File from MinIO
   * @param fieldUpload
   * @param directory
   * @returns
   */
  private async _uploadFileMinIO(
    fieldUpload: FileAttributes,
    directory: string
  ): Promise<{
    data: Minio.UploadedObjectInfo | undefined
    signedURL: string
  }> {
    const keyFile = `${directory}/${fieldUpload.filename}`

    const data = await this._clientMinio?.fPutObject(
      STORAGE_BUCKET_NAME,
      keyFile,
      fieldUpload.path,
      {
        ContentType: fieldUpload.mimetype, // <-- this is what you need!
        ContentDisposition: `inline; filename=${fieldUpload.filename}`, // <-- and this !
        ACL: 'public-read', // <-- this makes it public so people can see it
      }
    )

    const signedURL = await this.getPresignedURL(keyFile)
    const result = { data, signedURL }

    return result
  }

  /**
   * Upload File from Google Cloud Storage
   * @param fieldUpload
   * @param directory
   * @returns
   */
  private async _uploadFileGCS(
    fieldUpload: FileAttributes,
    directory: string
  ): Promise<{
    data: UploadResponse | undefined
    signedURL: string
  }> {
    const keyFile = `${directory}/${fieldUpload.filename}`

    // For a destination object that does not yet exist,
    // set the ifGenerationMatch precondition to 0
    // If the destination object already exists in your bucket, set instead a
    // generation-match precondition using its generation number.
    const generationMatchPrecondition = 0

    const options: UploadOptions = {
      destination: keyFile,
      preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
    }

    // send file upload to google cloud storage
    const data = await this._clientGCS
      ?.bucket(STORAGE_BUCKET_NAME)
      .upload(fieldUpload.path, options)

    const signedURL = await this.getPresignedURL(keyFile)
    const result = { data: data?.[1], signedURL }

    return result
  }

  /**
   * Upload File to Storage Provider
   * @param fieldUpload
   * @param directory
   * @returns
   */
  public async uploadFile<T>(
    fieldUpload: FileAttributes,
    directory: string
  ): Promise<{ data: T; signedURL: string }> {
    let result: { data: T | any; signedURL: string } = {
      data: '',
      signedURL: '',
    }

    if (this.type === 's3') {
      result = await this._uploadFileS3(fieldUpload, directory)
    }

    if (this.type === 'minio') {
      result = await this._uploadFileMinIO(fieldUpload, directory)
    }

    if (this.type === 'gcs') {
      result = await this._uploadFileGCS(fieldUpload, directory)
    }

    return result
  }
}

export default StorageProvider
