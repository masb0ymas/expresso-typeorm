import { TypeOrmRepository } from '@apps/interfaces/iRepository'
import uploadSchema from '@apps/schemas/upload.schema'
import { i18nConfig } from '@config/i18n'
import { optionsYup } from '@core/helpers/yup'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { Upload, type UploadAttributes } from '@database/entities/Upload'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import { validate as uuidValidate } from 'uuid'

export class UploadRepository extends TypeOrmRepository<Upload> {
  /**
   *
   * @param id
   * @param options
   * @returns
   */
  public async findById(id: string, options?: ReqOptions): Promise<Upload> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await this.findOne({
      where: { id },
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
   * @param id
   * @param options
   * @returns
   */
  public async findByKeyfile(
    keyFile: string,
    options?: ReqOptions
  ): Promise<Upload> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await this.findOne({
      where: { keyFile },
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
  public async create(formData: UploadAttributes): Promise<Upload> {
    const newEntity = new Upload()

    const value = uploadSchema.create.validateSync(formData, optionsYup)
    const data = await this.save({ ...newEntity, ...value })

    return data
  }

  /**
   *
   * @param id
   * @param formData
   * @param options
   * @returns
   */
  public async update(
    id: string,
    formData: UploadAttributes,
    options?: ReqOptions
  ): Promise<Upload> {
    const data = await this.findById(id, options)

    const value = uploadSchema.create.validateSync(formData, optionsYup)
    const newData = await this.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param formData
   * @param UploadId
   * @returns
   */
  public async createOrUpdate(
    formData: UploadAttributes,
    UploadId?: string
  ): Promise<Upload> {
    let data

    if (!_.isEmpty(UploadId) && uuidValidate(String(UploadId))) {
      const getUpload = await this.findOne({ where: { id: UploadId } })

      if (getUpload) {
        // update
        data = await this.save({ ...getUpload, ...formData })
      } else {
        // create
        data = await this.create(formData)
      }
    } else {
      // create
      data = await this.create(formData)
    }

    return data
  }
}
