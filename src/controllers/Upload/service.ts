import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { clientS3, s3ExpiresDate, s3ObjectExpired } from '@config/clientS3'
import { APP_LANG, AWS_BUCKET_NAME, GCS_BUCKET_NAME } from '@config/env'
import {
  gcsExpiresDate,
  gcsObjectExpired,
  storageClient,
} from '@config/googleCloudStorage'
import { i18nConfig } from '@config/i18nextConfig'
import { AppDataSource } from '@database/data-source'
import { Upload, UploadAttributes } from '@database/entities/Upload'
import { logServer, validateUUID } from '@expresso/helpers/Formatter'
import { optionsYup } from '@expresso/helpers/Validation'
import { useQuery } from '@expresso/hooks/useQuery'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import { ReqOptions } from '@expresso/interfaces/ReqOptions'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { GetSignedUrlConfig, UploadOptions } from '@google-cloud/storage'
import { endOfYesterday } from 'date-fns'
import { Request } from 'express'
import fs from 'fs'
import { TOptions } from 'i18next'
import _ from 'lodash'
import { SelectQueryBuilder } from 'typeorm'
import { validate as uuidValidate } from 'uuid'
import {
  DtoUploadGCSWithSignedUrl,
  DtoUploadS3WithSignedUrl,
  UploadFileWithSignedURLEntity,
} from './interface'
import uploadSchema from './schema'

class UploadService {
  private static readonly entity = 'Upload'

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Upload>> {
    const uploadRepository = AppDataSource.getRepository(Upload)
    const { lang } = req.getQuery()

    const defaultLang = lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = uploadRepository.createQueryBuilder()
    const newQuery = useQuery(this.entity, query, req)

    const data = await newQuery.getMany()
    const total = await newQuery.getCount()

    const message = i18nConfig.t('success.data_received', i18nOpt)
    return { message: `${total} ${message}`, data, total }
  }

  /**
   *
   * @param id
   * @param options
   * @returns
   */
  public static async findById(
    id: string,
    options?: ReqOptions
  ): Promise<Upload> {
    const uploadRepository = AppDataSource.getRepository(Upload)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const newId = validateUUID(id, { ...options })
    const data = await uploadRepository.findOne({
      where: { id: newId },
      withDeleted: options?.withDeleted,
    })

    if (!data) {
      const message = i18nConfig.t('errors.not_found', i18nOpt)
      throw new ResponseError.NotFound(`upload ${message}`)
    }

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: UploadAttributes): Promise<Upload> {
    const uploadRepository = AppDataSource.getRepository(Upload)
    const data = new Upload()

    const value = uploadSchema.create.validateSync(formData, optionsYup)
    const newData = await uploadRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param id
   * @param formData
   * @param options
   * @returns
   */
  public static async update(
    id: string,
    formData: Partial<UploadAttributes>,
    options?: ReqOptions
  ): Promise<Upload> {
    const uploadRepository = AppDataSource.getRepository(Upload)
    const data = await this.findById(id, { ...options })

    const value = uploadSchema.create.validateSync(
      { ...data, ...formData },
      optionsYup
    )

    const newData = await uploadRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param key_file
   * @returns
   */
  public static async deleteObjectS3(
    key_file: string
  ): Promise<DeleteObjectCommandOutput> {
    const dataAwsS3 = await clientS3.send(
      new DeleteObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key_file,
      })
    )

    console.log(logServer('Aws S3 : ', 'Success. Object deleted.'), dataAwsS3)

    return dataAwsS3
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    const data = await this.findById(id, { withDeleted: true, ...options })
    await uploadRepository.restore(data.id)
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async softDelete(
    id: string,
    options?: ReqOptions
  ): Promise<void> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    const data = await this.findById(id, { ...options })
    await uploadRepository.softDelete(data.id)
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async forceDelete(
    id: string,
    options?: ReqOptions
  ): Promise<void> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    const data = await this.findById(id, { ...options })

    // delete file from aws s3
    await this.deleteObjectS3(data.key_file)

    await uploadRepository.delete(data.id)
  }

  /**
   *
   * @param ids
   * @param options
   */
  private static multipleGetByIds(
    ids: string[],
    options?: ReqOptions
  ): SelectQueryBuilder<Upload> {
    const uploadRepository = AppDataSource.getRepository(Upload)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    if (_.isEmpty(ids)) {
      const message = i18nConfig.t('errors.cant_be_empty', i18nOpt)
      throw new ResponseError.BadRequest(`ids ${message}`)
    }

    // query by ids
    const query = uploadRepository
      .createQueryBuilder()
      .where(`${this.entity}.id IN (:...ids)`, { ids: [...ids] })

    return query
  }

  /**
   *
   * @param ids
   * @param options
   */
  public static async multipleRestore(
    ids: string[],
    options?: ReqOptions
  ): Promise<void> {
    const query = this.multipleGetByIds(ids, options).withDeleted()

    // restore record
    await query.restore().execute()
  }

  /**
   *
   * @param ids
   * @param options
   */
  public static async multipleSoftDelete(
    ids: string[],
    options?: ReqOptions
  ): Promise<void> {
    const query = this.multipleGetByIds(ids, options)

    // soft delete record
    await query.softDelete().execute()
  }

  /**
   *
   * @param ids
   * @param options
   */
  public static async multipleForceDelete(
    ids: string[],
    options?: ReqOptions
  ): Promise<void> {
    const query = this.multipleGetByIds(ids, options)

    const getUpload = await query.getMany()

    if (!_.isEmpty(getUpload)) {
      for (let i = 0; i < getUpload.length; i += 1) {
        const item = getUpload[i]

        // delete file from aws s3
        await this.deleteObjectS3(item.key_file)
      }
    }

    // delete record
    await query.delete().execute()
  }

  /**
   * Get Signed URL from AWS S3
   * @param keyFile
   * @returns
   */
  public static async getSignedUrlS3(keyFile: string): Promise<string> {
    // signed url from bucket S3
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: keyFile,
    })
    const signed_url = await getSignedUrl(clientS3, command, {
      expiresIn: s3ObjectExpired,
    })

    return signed_url
  }

  /**
   * Get Signed URL from Google Cloud Storage
   * @param keyFile
   * @returns
   */
  public static async getSignedUrlGCS(keyFile: string): Promise<string> {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + gcsObjectExpired, // 7 days
    }

    // signed url from bucket google cloud storage
    const data = await storageClient
      .bucket(GCS_BUCKET_NAME)
      .file(keyFile)
      .getSignedUrl(options)

    const signed_url = data[0]

    return signed_url
  }

  /**
   * Upload File Aws S3 with Signed URL
   * @param values
   * @returns
   */
  public static async uploadFileS3WithSignedUrl(
    values: UploadFileWithSignedURLEntity
  ): Promise<DtoUploadS3WithSignedUrl> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    const { fieldUpload, directory, UploadId } = values

    let resUpload

    const key_file = `${directory}/${fieldUpload.filename}`

    // send file upload to AWS S3
    const dataAwsS3 = await clientS3.send(
      new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key_file,
        Body: fs.createReadStream(fieldUpload.path),
        ContentType: fieldUpload.mimetype, // <-- this is what you need!
        ContentDisposition: `inline; filename=${fieldUpload.filename}`, // <-- and this !
        ACL: 'public-read', // <-- this makes it public so people can see it
      })
    )

    // const sevenDays = 24 * 7
    // const expiresIn = sevenDays * 60 * 60

    // signed url from bucket S3
    const signed_url = await this.getSignedUrlS3(key_file)

    const formUpload = {
      ...fieldUpload,
      key_file,
      signed_url,
      expiry_date_url: s3ExpiresDate,
    }

    // check uuid
    if (!_.isEmpty(UploadId) && uuidValidate(String(UploadId))) {
      // find upload
      const getUpload = await uploadRepository.findOne({
        where: { id: String(UploadId) },
      })

      // update file upload
      if (getUpload) {
        resUpload = await uploadRepository.save({ ...getUpload, ...formUpload })
      } else {
        // create new file
        resUpload = await this.create(formUpload)
      }
    } else {
      // create new file
      resUpload = await this.create(formUpload)
    }

    const data = { aws_s3_data: dataAwsS3, upload_data: resUpload }

    return data
  }

  /**
   * Upload File Google Cloud Storage With Signed URL
   * @param values
   * @returns
   */
  public static async uploadFileGCSWithSignedUrl(
    values: UploadFileWithSignedURLEntity
  ): Promise<DtoUploadGCSWithSignedUrl> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    const { fieldUpload, directory, UploadId } = values

    let resUpload

    const key_file = `${directory}/${fieldUpload.filename}`

    // For a destination object that does not yet exist,
    // set the ifGenerationMatch precondition to 0
    // If the destination object already exists in your bucket, set instead a
    // generation-match precondition using its generation number.
    const generationMatchPrecondition = 0

    const options: UploadOptions = {
      destination: key_file,
      preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
    }

    // send file upload to google cloud storage
    const gcsData = await storageClient
      .bucket(GCS_BUCKET_NAME)
      .upload(fieldUpload.path, options)

    // signed url from bucket S3
    const signed_url = await this.getSignedUrlGCS(key_file)

    const formUpload = {
      ...fieldUpload,
      key_file,
      signed_url,
      expiry_date_url: gcsExpiresDate,
    }

    // check uuid
    if (!_.isEmpty(UploadId) && uuidValidate(String(UploadId))) {
      // find upload
      const getUpload = await uploadRepository.findOne({
        where: { id: String(UploadId) },
      })

      // update file upload
      if (getUpload) {
        resUpload = await uploadRepository.save({ ...getUpload, ...formUpload })
      } else {
        // create new file
        resUpload = await this.create(formUpload)
      }
    } else {
      // create new file
      resUpload = await this.create(formUpload)
    }

    const data = { gcs_data: gcsData[1], upload_data: resUpload }

    return data
  }

  /**
   * Update Signed URL Aws S3
   */
  public static async updateSignedUrlS3(): Promise<void> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    const query = uploadRepository
      .createQueryBuilder()
      .where(`${this.entity}.expiry_date_url < :expiry_date_url`, {
        expiry_date_url: endOfYesterday(),
      })

    const getUploads = await query.getMany()
    const chunkUploads = _.chunk(getUploads, 50)

    // chunk uploads data
    if (!_.isEmpty(chunkUploads)) {
      for (let i = 0; i < chunkUploads.length; i += 1) {
        const itemUploads = chunkUploads[i]

        // check uploads
        if (!_.isEmpty(itemUploads)) {
          for (let i = 0; i < itemUploads.length; i += 1) {
            const item = itemUploads[i]

            const signed_url = await this.getSignedUrlS3(item.key_file)

            const formUpload = { signed_url, expiry_date_url: s3ExpiresDate }

            // update signed url & expires url
            await uploadRepository.save({ ...item, ...formUpload })
          }
        }
      }
    }
  }

  /**
   * Update Signed URL Google Cloud Storage
   */
  public static async updateSignedUrlGCS(): Promise<void> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    const query = uploadRepository
      .createQueryBuilder()
      .where(`${this.entity}.expiry_date_url < :expiry_date_url`, {
        expiry_date_url: endOfYesterday(),
      })

    const getUploads = await query.getMany()
    const chunkUploads = _.chunk(getUploads, 50)

    // chunk uploads data
    if (!_.isEmpty(chunkUploads)) {
      for (let i = 0; i < chunkUploads.length; i += 1) {
        const itemUploads = chunkUploads[i]

        // check uploads
        if (!_.isEmpty(itemUploads)) {
          for (let i = 0; i < itemUploads.length; i += 1) {
            const item = itemUploads[i]

            const signed_url = await this.getSignedUrlGCS(item.key_file)

            const formUpload = { signed_url, expiry_date_url: gcsExpiresDate }

            // update signed url & expires url
            await uploadRepository.save({ ...item, ...formUpload })
          }
        }
      }
    }
  }
}

export default UploadService
