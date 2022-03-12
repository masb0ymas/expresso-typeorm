import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { clientS3, s3ExpiresDate, s3ObjectExpired } from '@config/clientS3'
import { AWS_BUCKET_NAME } from '@config/env'
import { Upload, UploadAttributes } from '@database/entities/Upload'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import { FileAttributes } from '@expresso/interfaces/Files'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { endOfYesterday } from 'date-fns'
import { Request } from 'express'
import fs from 'fs'
import _ from 'lodash'
import { getRepository } from 'typeorm'
import { validate as uuidValidate } from 'uuid'
import uploadSchema from './schema'

interface DtoPaginate extends DtoFindAll {
  data: Upload[]
}

class UploadService {
  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoPaginate> {
    const uploadRepository = getRepository(Upload)
    const reqQuery = req.getQuery()

    // query pagination
    const page = Number(_.get(reqQuery, 'page', 1))
    const pageSize = Number(_.get(reqQuery, 'pageSize', 10))

    // query where
    const keyFile = _.get(reqQuery, 'keyFile', null)

    const query = uploadRepository
      .createQueryBuilder()
      .skip((page - 1) * pageSize)
      .take(pageSize)

    if (!_.isEmpty(keyFile)) {
      query.where('Upload.keyFile ILIKE :keyFile', { keyFile: `%${keyFile}%` })
    }

    const data = await query.orderBy('Upload.createdAt', 'DESC').getMany()
    const total = await query.getCount()

    return { message: `${total} data has been received.`, data, total }
  }

  /**
   *
   * @param id
   * @returns
   */
  public static async findById(id: string): Promise<Upload> {
    const uploadRepository = getRepository(Upload)

    const newId = validateUUID(id)
    const data = await uploadRepository.findOne(newId)

    if (!data) {
      throw new ResponseError.NotFound(
        'upload data not found or has been deleted'
      )
    }

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: UploadAttributes): Promise<Upload> {
    const uploadRepository = getRepository(Upload)
    const data = new Upload()

    const value = useValidation(uploadSchema.create, formData)
    const newData = await uploadRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param id
   * @param formData
   * @returns
   */
  public static async update(
    id: string,
    formData: Partial<UploadAttributes>
  ): Promise<Upload> {
    const uploadRepository = getRepository(Upload)
    const data = await this.findById(id)

    const value = useValidation(uploadSchema.create, {
      ...data,
      ...formData,
    })

    const newData = await uploadRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param id
   */
  public static async restore(id: string): Promise<void> {
    const uploadRepository = getRepository(Upload)

    const newId = validateUUID(id)
    await uploadRepository.restore(newId)
  }

  /**
   *
   * @param id
   */
  public static async softDelete(id: string): Promise<void> {
    const uploadRepository = getRepository(Upload)

    const data = await this.findById(id)
    await uploadRepository.softDelete(data.id)
  }

  /**
   *
   * @param id
   */
  public static async forceDelete(id: string): Promise<void> {
    const uploadRepository = getRepository(Upload)
    const data = await this.findById(id)

    await uploadRepository.delete(data.id)
  }

  /**
   * Multiple Force Delete
   * @param ids
   */
  public static async multipleRestore(ids: string[]): Promise<void> {
    const userRepository = getRepository(Upload)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('Upload.id IN (:...ids)', { ids: [...ids] })
      .restore()
      .execute()
  }

  /**
   * Multiple Soft Delete
   * @param ids
   */
  public static async multipleSoftDelete(ids: string[]): Promise<void> {
    const userRepository = getRepository(Upload)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('Upload.id IN (:...ids)', { ids: [...ids] })
      .softDelete()
      .execute()
  }

  /**
   * Multiple Force Delete
   * @param ids
   */
  public static async multipleForceDelete(ids: string[]): Promise<void> {
    const userRepository = getRepository(Upload)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('Upload.id IN (:...ids)', { ids: [...ids] })
      .delete()
      .execute()
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
    const signedUrl = await getSignedUrl(clientS3, command, {
      expiresIn: s3ObjectExpired,
    })

    return signedUrl
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
  ): Promise<{
    dataAwsS3: PutObjectCommandOutput
    resUpload: Upload
  }> {
    const uploadRepository = getRepository(Upload)

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
    const signedUrl = await this.getSignedUrlS3(keyFile)

    const formUpload = {
      ...fieldUpload,
      keyFile,
      signedUrl,
      expiryDateUrl: s3ExpiresDate,
    }

    // check uuid
    if (!_.isEmpty(UploadId) && uuidValidate(String(UploadId))) {
      // find upload
      const getUpload = await uploadRepository.findOne(String(UploadId))

      if (getUpload) {
        resUpload = await uploadRepository.save({ ...getUpload, ...formUpload })
      } else {
        resUpload = await this.create(formUpload)
      }
    } else {
      resUpload = await this.create(formUpload)
    }

    return { dataAwsS3, resUpload }
  }

  /**
   * Update Signed URL Aws S3
   */
  public static async updateSignedUrl(): Promise<void> {
    const uploadRepository = getRepository(Upload)

    const query = uploadRepository
      .createQueryBuilder()
      .where('Upload.expiryDateUrl < :expiryDateUrl', {
        expiryDateUrl: endOfYesterday(),
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

            const signedUrl = await this.getSignedUrlS3(item.keyFile)

            const formUpload = {
              signedUrl,
              expiresUrlDate: s3ExpiresDate,
            }

            // update signed url & expires url
            await uploadRepository.save({ ...item, ...formUpload })
          }
        }
      }
    }
  }
}

export default UploadService
