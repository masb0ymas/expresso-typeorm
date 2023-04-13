import { type UploadFileEntity } from '@apps/interfaces/Upload'
import uploadSchema from '@apps/schemas/upload.schema'
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
import { sub } from 'date-fns'
import { type Request } from 'express'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import type * as Minio from 'minio'
import {
  In,
  LessThanOrEqual,
  type FindOneOptions,
  type Repository,
} from 'typeorm'
import { validate as uuidValidate } from 'uuid'

interface UploadRepository {
  upload: Repository<Upload>
}

export default class UploadService {
  private static readonly _entity = 'Upload'

  /**
   * Collect Repository
   * @returns
   */
  private static _repository(): UploadRepository {
    const upload = AppDataSource.getRepository(Upload)

    return { upload }
  }

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Upload>> {
    // declare repository
    const uploadRepository = this._repository().upload

    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    // create query builder
    const query = uploadRepository.createQueryBuilder()

    // use query
    const newQuery = useQuery({ entity: this._entity, query, reqQuery })

    const data = await newQuery.getMany()
    const total = await newQuery.getCount()

    const message = i18nConfig.t('success.data_received', i18nOpt)
    return { message: `${total} ${message}`, data, total }
  }

  /**
   *
   * @param options
   * @returns
   */
  private static async _findOne<T>(
    options: FindOneOptions<T> & { lang?: string }
  ): Promise<Upload> {
    const uploadRepository = this._repository().upload
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await uploadRepository.findOne({
      where: options.where,
      relations: options.relations,
      withDeleted: options.withDeleted,
    })

    if (!data) {
      const options = { ...i18nOpt, entity: 'upload' }
      const message = i18nConfig.t('errors.not_found', options)

      throw new ResponseError.NotFound(message)
    }

    return data
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
    const data = await this._findOne<Upload>({
      where: { id: newId },
      lang: options?.lang,
    })

    return data
  }

  /**
   *
   * @param keyFile
   * @param options
   * @returns
   */
  public static async findByKeyfile(
    keyFile: string,
    options?: ReqOptions
  ): Promise<Upload> {
    const data = await this._findOne<Upload>({
      where: { keyFile },
      lang: options?.lang,
    })

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: UploadAttributes): Promise<Upload> {
    const uploadRepository = this._repository().upload
    const newEntity = new Upload()

    const value = uploadSchema.create.validateSync(formData, optionsYup)
    const data = await uploadRepository.save({ ...newEntity, ...value })

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
  ): Promise<Upload> {
    const uploadRepository = this._repository().upload
    const data = await this.findById(id, options)

    const value = uploadSchema.create.validateSync(formData, optionsYup)
    const newData = await uploadRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param formData
   * @param UploadId
   * @returns
   */
  public static async createOrUpdate(
    formData: UploadAttributes,
    UploadId?: string
  ): Promise<Upload> {
    const uploadRepository = this._repository().upload
    let data

    if (!_.isEmpty(UploadId) && uuidValidate(String(UploadId))) {
      const getUpload = await uploadRepository.findOne({
        where: { id: UploadId },
      })

      if (getUpload) {
        // update
        data = await uploadRepository.save({ ...getUpload, ...formData })
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

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const uploadRepository = this._repository().upload

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
    const uploadRepository = this._repository().upload

    const data = await this.findById(id, options)

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
    const uploadRepository = this._repository().upload

    const data = await this.findById(id, options)

    await uploadRepository.delete(data.id)
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
    const uploadRepository = this._repository().upload

    this._validateGetByIds(ids, options)

    await uploadRepository.restore({ id: In(ids) })
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
    const uploadRepository = this._repository().upload

    this._validateGetByIds(ids, options)

    await uploadRepository.softDelete({ id: In(ids) })
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
    const uploadRepository = this._repository().upload

    this._validateGetByIds(ids, options)

    await uploadRepository.delete({ id: In(ids) })
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
    const uploadRepository = this._repository().upload
    const data = await this.findByKeyfile(keyFile, options)

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

    const uploadResponse = await this.createOrUpdate(formUpload, UploadId)
    const data = { storageResponse, uploadResponse }

    return data
  }

  /**
   * Update Signed URL
   */
  public static async updateSignedURL(): Promise<void> {
    const uploadRepository = this._repository().upload

    // get uploads
    const getUploads = await uploadRepository.find({
      where: { updatedAt: LessThanOrEqual(sub(new Date(), { days: 3 })) },
      take: 10,
      order: { updatedAt: 'ASC' },
    })

    const { expiryDate } = storageService.expiresObject()

    // check uploads
    if (!_.isEmpty(getUploads)) {
      for (let i = 0; i < getUploads.length; i += 1) {
        const item = getUploads[i]

        const signedURL = await storageService.getPresignedURL(item.keyFile)

        // update signed url
        await uploadRepository.update(
          { id: item.id },
          { signedURL, expiryDateURL: expiryDate }
        )
      }
    }
  }
}
