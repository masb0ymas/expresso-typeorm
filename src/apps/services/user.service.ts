import { UserRepository } from '@apps/repositories/user.repository'
import userSchema from '@apps/schemas/user.schema'
import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18n'
import { validateUUID } from '@core/helpers/formatter'
import { optionsYup } from '@core/helpers/yup'
import { type DtoFindAll } from '@core/interface/Paginate'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { AppDataSource } from '@database/data-source'
import { User, type UserAttributes } from '@database/entities/User'
import { type Request } from 'express'
import { validateEmpty } from 'expresso-core'
import { type TOptions } from 'i18next'
import _ from 'lodash'

const userRepository = new UserRepository({
  entity: 'User',
  repository: AppDataSource.getRepository(User),
})

export default class UserService {
  private static readonly _entity = 'User'
  private static readonly _repository = userRepository

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<User>> {
    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = this._repository
      .findQuery(reqQuery)
      .leftJoinAndSelect(`${this._entity}.Role`, 'Role')
      .leftJoinAndSelect(`${this._entity}.Upload`, 'Upload')
      .leftJoinAndSelect(`${this._entity}.Sessions`, 'Session')

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
  public static async getById(id: string, options?: ReqOptions): Promise<User> {
    const newId = validateUUID(id, { ...options })
    const data = await this._repository.findById(newId, options)

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
  ): Promise<User> {
    const newId = validateUUID(id, { ...options })
    const data = await this._repository.findById(newId, {
      ...options,
      relations: ['Role', 'Upload', 'Sessions'],
    })

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: UserAttributes): Promise<User> {
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
    formData: UserAttributes,
    options?: ReqOptions
  ): Promise<User> {
    const data = await this.getById(id, options)

    // validate email from request
    if (!_.isEmpty(formData.email) && formData.email !== data.email) {
      await this.validateEmail(String(formData.email), { ...options })
    }

    const value = userSchema.create.validateSync(formData, optionsYup)

    const newFormData = {
      ...data,
      ...value,
      phone: validateEmpty(value?.phone),
      password: validateEmpty(value?.confirmNewPassword),
    }

    // @ts-expect-error
    const newData = await this._repository.save(newFormData)

    return newData
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const data = await this.getById(id, { withDeleted: true, ...options })

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
    const data = await this.getById(id, options)

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
    const data = await this.getById(id, options)

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
   * @param email
   * @param options
   */
  public static async validateEmail(
    email: string,
    options?: ReqOptions
  ): Promise<void> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await this._repository.findOne({
      where: { email },
    })

    if (data) {
      const message = i18nConfig.t('errors.already_email', i18nOpt)
      throw new ResponseError.BadRequest(message)
    }
  }
}
