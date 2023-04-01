import { type UploadFileEntity } from '@apps/interfaces/Upload'
import { UploadRepository } from '@apps/repositories/upload.repository'
import uploadSchema from '@apps/schemas/upload.schema'
import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18n'
import { storageService } from '@config/storage'
import { validateUUID } from '@core/helpers/formatter'
import { optionsYup } from '@core/helpers/yup'
import { type DtoFindAll } from '@core/interface/Paginate'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { AppDataSource } from '@database/data-source'
import { Upload, type UploadAttributes } from '@database/entities/Upload'
import { type Request } from 'express'
import { type TOptions } from 'i18next'
import type * as Minio from 'minio'
import _ from 'lodash'
import { LessThanOrEqual } from 'typeorm'
import { sub } from 'date-fns'

const uploadRepository = new UploadRepository({
  entity: 'Upload',
  repository: AppDataSource.getRepository(Upload),
})

export default class UploadService {
  private static readonly _repository = uploadRepository

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Upload>> {
    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = this._repository.findQuery(reqQuery)

    const data = await query.getMany()
    const total = await query.getCount()

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
    const newId = validateUUID(id, { ...options })
    const data = await this._repository.findById(newId, options)

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: UploadAttributes): Promise<Upload> {
    const data = await this._repository.create(formData)

    return data
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
    formData: UploadAttributes,
    options?: ReqOptions
  ): Promise<Upload | undefined> {
    const newData = await this._repository.update(id, formData, options)

    return newData
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const data = await this.findById(id, { withDeleted: true, ...options })

    await this._repository.restore(data.id)
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
    const data = await this.findById(id, options)

    await this._repository.softDelete(data.id)
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
    const data = await this.findById(id, options)

    await this._repository.forceDelete(data.id)
  }

  /**
   *
   * @param ids
   * @param options
   */
  private static _validateGetByIds(ids: string[], options?: ReqOptions): void {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    if (_.isEmpty(ids)) {
      const message = i18nConfig.t('errors.cant_be_empty', i18nOpt)
      throw new ResponseError.BadRequest(`ids ${message}`)
    }
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
    this._validateGetByIds(ids, options)

    await this._repository.multipleRestore(ids)
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
    this._validateGetByIds(ids, options)

    await this._repository.multipleSoftDelete(ids)
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
    this._validateGetByIds(ids, options)

    await this._repository.multipleForceDelete(ids)
  }

  /**
   *
   * @param keyFile
   * @param options
   * @returns
   */
  public static async getPresignedURL(
    keyFile: string,
    options?: ReqOptions
  ): Promise<Upload> {
    const data = await this._repository.findByKeyfile(keyFile, options)

    const signedURL = await storageService.getPresignedURL(keyFile)

    const value = uploadSchema.create.validateSync(
      { ...data, signedURL },
      optionsYup
    )

    const newData = await this._repository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param params
   * @returns
   */
  public static async uploadFile(params: UploadFileEntity): Promise<{
    storageResponse: any
    uploadResponse: Upload
  }> {
    const { fieldUpload, directory, UploadId } = params

    const { expiryDate } = storageService.expiresObject()
    const keyFile = `${directory}/${fieldUpload.filename}`

    const { data: storageResponse, signedURL } =
      await storageService.uploadFile<Minio.Client>(fieldUpload, directory)

    const formUpload = {
      ...fieldUpload,
      keyFile,
      signedURL,
      expiryDateURL: expiryDate,
    }

    const uploadResponse = await this._repository.createOrUpdate(
      formUpload,
      UploadId
    )
    const data = { storageResponse, uploadResponse }

    return data
  }

  /**
   * Update Signed URL
   */
  public static async updateSignedURL(): Promise<void> {
    // get uploads
    const getUploads = await this._repository.find({
      where: { updatedAt: LessThanOrEqual(sub(new Date(), { days: 3 })) },
    })

    const chunkUploads = _.chunk(getUploads, 50)

    // chunk uploads data
    if (!_.isEmpty(chunkUploads)) {
      for (let i = 0; i < chunkUploads.length; i += 1) {
        const itemUploads = chunkUploads[i]

        // check uploads
        if (!_.isEmpty(itemUploads)) {
          for (let i = 0; i < itemUploads.length; i += 1) {
            const item = itemUploads[i]

            // update signed url
            await this.getPresignedURL(item.keyFile)
          }
        }
      }
    }
  }
}
