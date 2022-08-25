import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { clientS3, s3ExpiresDate, s3ObjectExpired } from '@config/clientS3'
import { APP_LANG, AWS_BUCKET_NAME } from '@config/env'
import { i18nConfig } from '@config/i18nextConfig'
import { AppDataSource } from '@database/data-source'
import { Upload, UploadAttributes } from '@database/entities/Upload'
import { logServer, validateUUID } from '@expresso/helpers/Formatter'
import { optionsYup } from '@expresso/helpers/Validation'
import { FileAttributes } from '@expresso/interfaces/Files'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import { ReqOptions } from '@expresso/interfaces/ReqOptions'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { queryFiltered } from '@expresso/modules/TypeORMQuery'
import { endOfYesterday } from 'date-fns'
import { Request } from 'express'
import fs from 'fs'
import { TOptions } from 'i18next'
import _ from 'lodash'
import { SelectQueryBuilder } from 'typeorm'
import { validate as uuidValidate } from 'uuid'
import uploadSchema from './schema'

interface DtoPaginate extends DtoFindAll {
  data: Upload[]
}

interface DtoUploadWithSignedUrlEntity {
  dataAwsS3: PutObjectCommandOutput
  resUpload: Upload
}

class UploadService {
  private static readonly entity = 'Upload'

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoPaginate> {
    const uploadRepository = AppDataSource.getRepository(Upload)
    const { lang } = req.getQuery()

    const defaultLang = lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = uploadRepository.createQueryBuilder()
    const newQuery = queryFiltered(this.entity, query, req)

    const data = await newQuery
      .orderBy(`${this.entity}.createdAt`, 'DESC')
      .getMany()
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
   * @param keyFile
   * @returns
   */
  public static async deleteObjectS3(
    keyFile: string
  ): Promise<DeleteObjectCommandOutput> {
    const dataAwsS3 = await clientS3.send(
      new DeleteObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: keyFile,
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
    await this.deleteObjectS3(data.keyFile)

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
        await this.deleteObjectS3(item.keyFile)
      }
    }

    // delete record
    await query.delete().execute()
  }

  /**
   *
   * @param keyFile
   * @returns
   */
  public static async getSignedUrlS3(keyFile: string): Promise<string> {
    // signed url from bucket S3
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: keyFile,
    })
    const signedURL = await getSignedUrl(clientS3, command, {
      expiresIn: s3ObjectExpired,
    })

    return signedURL
  }

  /**
   *
   * @param fieldUpload
   * @param directory
   * @param UploadId
   * @returns
   */
  public static async uploadFileWithSignedUrl(
    fieldUpload: FileAttributes,
    directory: string,
    UploadId?: string | null
  ): Promise<DtoUploadWithSignedUrlEntity> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    let resUpload

    const keyFile = `${directory}/${fieldUpload.filename}`

    // send file upload to AWS S3
    const dataAwsS3 = await clientS3.send(
      new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: keyFile,
        Body: fs.createReadStream(fieldUpload.path),
        ContentType: fieldUpload.mimetype, // <-- this is what you need!
        ContentDisposition: `inline; filename=${fieldUpload.filename}`, // <-- and this !
        ACL: 'public-read', // <-- this makes it public so people can see it
      })
    )

    // const sevenDays = 24 * 7
    // const expiresIn = sevenDays * 60 * 60

    // signed url from bucket S3
    const signedURL = await this.getSignedUrlS3(keyFile)

    const formUpload = {
      ...fieldUpload,
      keyFile,
      signedURL,
      expiryDateURL: s3ExpiresDate,
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

    return { dataAwsS3, resUpload }
  }

  /**
   * Update Signed URL Aws S3
   */
  public static async updateSignedUrl(): Promise<void> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    const query = uploadRepository
      .createQueryBuilder()
      .where(`${this.entity}.expiryDateURL < :expiryDateURL`, {
        expiryDateURL: endOfYesterday(),
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

            const signedURL = await this.getSignedUrlS3(item.keyFile)

            const formUpload = { signedURL, expiryDateURL: s3ExpiresDate }

            // update signed url & expires url
            await uploadRepository.save({ ...item, ...formUpload })
          }
        }
      }
    }
  }
}

export default UploadService
