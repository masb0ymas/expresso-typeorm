import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18n'
import { storageService } from '@config/storage'
import { validateUUID } from '@core/helpers/formatter'
import { optionsYup } from '@core/helpers/yup'
import { useQuery } from '@core/hooks/useQuery'
import { type DtoFindAll } from '@core/interface/Paginate'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { AppDataSource } from '@database/data-source'
import { Upload, type UploadAttributes } from '@database/entities/Upload'
import { type Request } from 'express'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import type * as Minio from 'minio'
import { type SelectQueryBuilder } from 'typeorm'
import { validate as uuidValidate } from 'uuid'
import { type UploadFileEntity } from './interface'
import uploadSchema from './schema'

class UploadService {
  private static readonly _entity = 'Upload'

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Upload>> {
    const uploadRepository = AppDataSource.getRepository(Upload)
    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = uploadRepository.createQueryBuilder()
    const newQuery = useQuery({ entity: this._entity, query, reqQuery })

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
   * @param keyFile
   * @param options
   * @returns
   */
  public static async findByKeyFile(
    keyFile: string,
    options?: ReqOptions
  ): Promise<Upload> {
    const uploadRepository = AppDataSource.getRepository(Upload)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await uploadRepository.findOne({
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
   * @param formData
   * @param id
   * @returns
   */
  public static async createOrUpdate(
    formData: UploadAttributes,
    id?: string | null
  ): Promise<Upload> {
    const uploadRepository = AppDataSource.getRepository(Upload)

    let resUpload
    const UploadId = String(id)

    if (!_.isEmpty(UploadId) && uuidValidate(String(UploadId))) {
      // find upload
      const getUpload = await uploadRepository.findOne({
        where: { id: UploadId },
      })

      if (getUpload) {
        // update
        resUpload = await uploadRepository.save({ ...getUpload, ...formData })
      } else {
        // create
        resUpload = await this.create(formData)
      }
    } else {
      // create
      resUpload = await this.create(formData)
    }

    return resUpload
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
    await uploadRepository.delete(data.id)
  }

  /**
   *
   * @param ids
   * @param options
   * @returns
   */
  private static _multipleGetByIds(
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
      .where(`${this._entity}.id IN (:...ids)`, { ids: [...ids] })

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
    const query = this._multipleGetByIds(ids, options).withDeleted()

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
    const query = this._multipleGetByIds(ids, options)

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
    const query = this._multipleGetByIds(ids, options)

    // delete record
    await query.delete().execute()
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
    const uploadRepository = AppDataSource.getRepository(Upload)
    const data = await this.findByKeyFile(keyFile, { ...options })

    const signedURL = await storageService.getPresignedURL(keyFile)

    const value = uploadSchema.create.validateSync(
      { ...data, signedURL },
      optionsYup
    )

    const newData = await uploadRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param params
   * @returns
   */
  public static async uploadFile({
    fieldUpload,
    directory,
    UploadId,
  }: UploadFileEntity): Promise<{
    storageResponse: any
    uploadResponse: Upload
  }> {
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

    const uploadResponse = await this.createOrUpdate(formUpload, UploadId)
    const data = { storageResponse, uploadResponse }

    return data
  }
}

export default UploadService
