import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18n'
import { validateUUID } from '@core/helpers/formatter'
import { optionsYup } from '@core/helpers/yup'
import { useQuery } from '@core/hooks/useQuery'
import { type DtoFindAll } from '@core/interface/Paginate'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { AppDataSource } from '@database/data-source'
import { User, type UserAttributes } from '@database/entities/User'
import { type Request } from 'express'
import { validateEmpty } from 'expresso-core'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import { type SelectQueryBuilder } from 'typeorm'
import userSchema from './schema'

class UserService {
  private static readonly _entity = 'User'

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<User>> {
    const userRepository = AppDataSource.getRepository(User)
    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = userRepository
      .createQueryBuilder()
      .leftJoinAndSelect(`${this._entity}.Role`, 'Role')
      .leftJoinAndSelect(`${this._entity}.Sessions`, 'Session')
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
  ): Promise<User> {
    const userRepository = AppDataSource.getRepository(User)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const newId = validateUUID(id, { ...options })
    const data = await userRepository.findOne({
      where: { id: newId },
      relations: ['Role', 'Sessions'],
      withDeleted: options?.withDeleted,
    })

    if (!data) {
      const message = i18nConfig.t('errors.not_found', i18nOpt)
      throw new ResponseError.NotFound(`user ${message}`)
    }

    return data
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
    const userRepository = AppDataSource.getRepository(User)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await userRepository.findOne({
      where: { email },
    })

    if (data) {
      const message = i18nConfig.t('errors.already_email', i18nOpt)
      throw new ResponseError.BadRequest(message)
    }
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: UserAttributes): Promise<User> {
    const userRepository = AppDataSource.getRepository(User)
    const data = new User()

    const value = userSchema.create.validateSync(formData, optionsYup)

    const newFormData = {
      ...data,
      ...value,
      phone: validateEmpty(value?.phone),
      password: validateEmpty(value?.confirmNewPassword),
    }

    // @ts-expect-error: Unreachable code error
    const newData = await userRepository.save(newFormData)

    // @ts-expect-error: Unreachable code error
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
    formData: Partial<UserAttributes>,
    options?: ReqOptions
  ): Promise<User> {
    const userRepository = AppDataSource.getRepository(User)
    const data = await this.findById(id, { ...options })

    // validate email from request
    if (!_.isEmpty(formData.email) && formData.email !== data.email) {
      await this.validateEmail(String(formData.email), { ...options })
    }

    const value = userSchema.create.validateSync(
      { ...data, ...formData },
      optionsYup
    )

    const newFormData = {
      ...data,
      ...value,
      phone: validateEmpty(value?.phone),
      password: validateEmpty(value?.confirmNewPassword),
    }

    // @ts-expect-error: Unreachable code error
    const newData = await userRepository.save(newFormData)

    // @ts-expect-error: Unreachable code error
    return newData
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const userRepository = AppDataSource.getRepository(User)

    const data = await this.findById(id, { withDeleted: true, ...options })
    await userRepository.restore(data.id)
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
    const userRepository = AppDataSource.getRepository(User)

    const data = await this.findById(id, { ...options })
    await userRepository.softDelete(data.id)
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
    const userRepository = AppDataSource.getRepository(User)

    const data = await this.findById(id, { ...options })
    await userRepository.delete(data.id)
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
  ): SelectQueryBuilder<User> {
    const userRepository = AppDataSource.getRepository(User)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    if (_.isEmpty(ids)) {
      const message = i18nConfig.t('errors.cant_be_empty', i18nOpt)
      throw new ResponseError.BadRequest(`ids ${message}`)
    }

    const query = userRepository
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
}

export default UserService
