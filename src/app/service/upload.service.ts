import { sub } from 'date-fns'
import { type Request } from 'express'
import { TypeS3 } from 'expresso-provider/lib/storage/types'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import {
  In,
  LessThanOrEqual,
  type FindOneOptions,
  type Repository,
} from 'typeorm'
import { validate as uuidValidate } from 'uuid'
import { env } from '~/config/env'
import { i18n } from '~/config/i18n'
import { storageService } from '~/config/storage'
import { type IReqOptions } from '~/core/interface/ReqOptions'
import { type DtoFindAll } from '~/core/interface/dto/Paginate'
import { useQuery } from '~/core/modules/hooks/useQuery'
import ResponseError from '~/core/modules/response/ResponseError'
import { validateUUID } from '~/core/utils/formatter'
import { AppDataSource } from '~/database/data-source'
import { Upload, type UploadAttributes } from '~/database/entities/Upload'
import { DtoUploadFile, type UploadFileEntity } from '../interface/Upload'
import uploadSchema from '../schema/upload.schema'

interface UploadRepository {
  uploadRepo: Repository<Upload>
}

export default class UploadService {
  private static readonly _entity = 'upload'

  /**
   * Collect Repository
   * @returns
   */
  private static _repository(): UploadRepository {
    const uploadRepo = AppDataSource.getRepository(Upload)

    return { uploadRepo }
  }

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Upload>> {
    // declare repository
    const { uploadRepo } = this._repository()

    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? env.APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    // create query builder
    const query = uploadRepo.createQueryBuilder(this._entity)

    // use query
    const newQuery = useQuery({ entity: this._entity, query, reqQuery })

    const data = await newQuery.getMany()
    const total = await newQuery.getCount()

    const message = i18n.t('success.data_received', i18nOpt)
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
    const { uploadRepo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await uploadRepo.findOne({
      where: options.where,
      relations: options.relations,
      withDeleted: options.withDeleted,
    })

    if (!data) {
      const options = { ...i18nOpt, entity: 'upload' }
      const message = i18n.t('errors.not_found', options)

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
    options?: IReqOptions
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
   * @param key_file
   * @param options
   * @returns
   */
  public static async findByKeyFile(
    key_file: string,
    options?: IReqOptions
  ): Promise<Upload> {
    const data = await this._findOne<Upload>({
      where: { key_file },
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
    const { uploadRepo } = this._repository()
    const newEntity = new Upload()

    const value = uploadSchema.create.parse(formData)
    const data = await uploadRepo.save({ ...newEntity, ...value })

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
    options?: IReqOptions
  ): Promise<Upload> {
    const { uploadRepo } = this._repository()
    const data = await this.findById(id, options)

    const value = uploadSchema.create.parse(formData)
    const newData = await uploadRepo.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param formData
   * @param upload_id
   * @returns
   */
  public static async createOrUpdate(
    formData: UploadAttributes,
    upload_id?: string
  ): Promise<Upload> {
    const { uploadRepo } = this._repository()
    let data

    if (!_.isEmpty(upload_id) && uuidValidate(String(upload_id))) {
      const getUpload = await uploadRepo.findOne({
        where: { id: upload_id },
      })

      if (getUpload) {
        // update
        data = await uploadRepo.save({ ...getUpload, ...formData })
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
  public static async restore(
    id: string,
    options?: IReqOptions
  ): Promise<void> {
    const { uploadRepo } = this._repository()

    const data = await this.findById(id, { withDeleted: true, ...options })

    await uploadRepo.restore(data.id)
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async softDelete(
    id: string,
    options?: IReqOptions
  ): Promise<void> {
    const { uploadRepo } = this._repository()

    const data = await this.findById(id, options)

    await uploadRepo.softDelete(data.id)
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async forceDelete(
    id: string,
    options?: IReqOptions
  ): Promise<void> {
    const { uploadRepo } = this._repository()

    const data = await this.findById(id, options)

    await uploadRepo.delete(data.id)
  }

  /**
   *
   * @param ids
   * @param options
   */
  private static _validateGetByIds(ids: string[], options?: IReqOptions): void {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    if (_.isEmpty(ids)) {
      const message = i18n.t('errors.cant_be_empty', i18nOpt)
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
    options?: IReqOptions
  ): Promise<void> {
    const { uploadRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await uploadRepo.restore({ id: In(ids) })
  }

  /**
   *
   * @param ids
   * @param options
   */
  public static async multipleSoftDelete(
    ids: string[],
    options?: IReqOptions
  ): Promise<void> {
    const { uploadRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await uploadRepo.softDelete({ id: In(ids) })
  }

  /**
   *
   * @param ids
   * @param options
   */
  public static async multipleForceDelete(
    ids: string[],
    options?: IReqOptions
  ): Promise<void> {
    const { uploadRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await uploadRepo.delete({ id: In(ids) })
  }

  /**
   *
   * @param key_file
   * @param options
   * @returns
   */
  public static async getPresignedURL(
    key_file: string,
    options?: IReqOptions
  ): Promise<Upload> {
    const { uploadRepo } = this._repository()
    const data = await this.findByKeyFile(key_file, options)

    const signed_url = await storageService.getPresignedURL(key_file)

    const value = uploadSchema.create.parse({ ...data, signed_url })
    const newData = await uploadRepo.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param params
   * @returns
   */
  public static async uploadFile(
    params: UploadFileEntity
  ): Promise<DtoUploadFile> {
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
  public static async updateSignedURL(): Promise<void> {
    const { uploadRepo } = this._repository()

    // get uploads
    const getUploads = await uploadRepo.find({
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
        await uploadRepo.update(
          { id: item.id },
          { signed_url, expiry_date_url: expiryDate }
        )
      }
    }
  }
}
