import { sub } from 'date-fns'
import { TypeS3 } from 'expresso-provider/lib/storage/types'
import _ from 'lodash'
import { LessThanOrEqual } from 'typeorm'
import { validate as uuidValidate } from 'uuid'
import { storageService } from '~/config/storage'
import { IReqOptions } from '~/core/interface/ReqOptions'
import { Upload, UploadAttributes } from '~/database/entities/Upload'
import { UploadFileEntity } from '../interface/Upload'
import uploadSchema from '../schema/upload.schema'
import BaseService from './base.service'

export default class UploadService extends BaseService<Upload> {
  constructor() {
    super({ tableName: 'upload', entity: Upload })
  }

  /**
   *
   * @param formData
   * @returns
   */
  public async create(formData: UploadAttributes) {
    const newEntity = new Upload()
    const value = uploadSchema.create.parse(formData)

    const data = await this.repository.save({ ...newEntity, ...value })
    return data
  }

  /**
   *
   * @param formData
   * @param upload_id
   * @returns
   */
  public async createOrUpdate(formData: UploadAttributes, upload_id?: string) {
    const value = uploadSchema.create.parse(formData)

    let data

    if (!_.isEmpty(upload_id) && uuidValidate(String(upload_id))) {
      const getUpload = await this.repository.findOne({
        where: { id: upload_id },
      })

      if (getUpload) {
        // update
        data = await this.repository.save({ ...getUpload, ...value })
      } else {
        data = await this.create(value)
      }
    } else {
      data = await this.create(value)
    }

    return data
  }

  /**
   *
   * @param key_file
   * @param options
   * @returns
   */
  public async findByKeyFile(
    key_file: string,
    options?: IReqOptions
  ): Promise<Upload> {
    const data = await this._findOne({
      ...options,
      where: { key_file },
    })

    return data
  }

  /**
   *
   * @param key_file
   * @param options
   * @returns
   */
  public async getPresignedURL(key_file: string, options?: IReqOptions) {
    const getUpload = await this.findByKeyFile(key_file, options)

    const signed_url = await storageService.getPresignedURL(key_file)

    const value = uploadSchema.create.parse({ ...getUpload, signed_url })
    const data = await this.repository.save({ ...getUpload, ...value })

    return data
  }

  /**
   *
   * @param params
   * @returns
   */
  public async uploadFile(params: UploadFileEntity) {
    const { fieldUpload, directory, upload_id } = params

    const { expiryDate } = storageService.expiresObject()
    const key_file = `${directory}/${fieldUpload.filename}`

    const { data: storageResponse, signedURL: signed_url } =
      await storageService.uploadFile<TypeS3>(fieldUpload, directory)

    const formUpload = {
      ...fieldUpload,
      key_file,
      signed_url,
      expiry_date_url: expiryDate,
    }

    const upload = await this.createOrUpdate(formUpload, upload_id)
    const data = { storage: storageResponse, upload }

    return data
  }

  /**
   * Update Signed URL
   */
  public async updateSignedURL() {
    const getUploads = await this.repository.find({
      where: { updated_at: LessThanOrEqual(sub(new Date(), { days: 3 })) },
      take: 10,
      order: { updated_at: 'ASC' },
    })

    const { expiryDate } = storageService.expiresObject()

    // check uploads
    if (!_.isEmpty(getUploads)) {
      for (let i = 0; i < getUploads.length; i += 1) {
        const item = getUploads[i]

        const signed_url = await storageService.getPresignedURL(item.key_file)

        // update signed url
        await this.repository.update(
          { id: item.id },
          { signed_url, expiry_date_url: expiryDate }
        )
      }
    }
  }
}
