import userSchema from '@apps/schemas/user.schema'
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
import { In, type FindOneOptions, type Repository } from 'typeorm'

interface UserRepository {
  user: Repository<User>
}

export default class UserService {
  private static readonly _entity = 'User'

  /**
   * Collect Repository
   * @returns
   */
  private static _repository(): UserRepository {
    const user = AppDataSource.getRepository(User)

    return { user }
  }

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<User>> {
    // declare repository
    const userRepository = this._repository().user

    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    // create query builder
    const query = userRepository.createQueryBuilder()

    // use query
    const newQuery = useQuery({ entity: this._entity, query, reqQuery })
      .leftJoinAndSelect(`${this._entity}.Role`, 'Role')
      .leftJoinAndSelect(`${this._entity}.Upload`, 'Upload')
      .leftJoinAndSelect(`${this._entity}.Sessions`, 'Session')

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
  ): Promise<User> {
    const userRepository = this._repository().user
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await userRepository.findOne({
      where: options.where,
      relations: options.relations,
      withDeleted: options.withDeleted,
    })

    if (!data) {
      const options = { ...i18nOpt, entity: 'user' }
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
  public static async getById(id: string, options?: ReqOptions): Promise<User> {
    const newId = validateUUID(id, { ...options })
    const data = await this._findOne<User>({
      where: { id: newId },
      lang: options?.lang,
    })

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
    const data = await this._findOne<User>({
      where: { id: newId },
      relations: ['Role', 'Upload', 'Sessions'],
      lang: options?.lang,
    })

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: UserAttributes): Promise<User> {
    const userRepository = this._repository().user
    const newEntity = new User()

    const value = userSchema.create.validateSync(formData, optionsYup)

    const newFormData = {
      ...newEntity,
      ...value,
      phone: validateEmpty(value?.phone),
      password: validateEmpty(value?.confirmNewPassword),
    }

    // @ts-expect-error
    const data = await userRepository.save(newFormData)

    // @ts-expect-error
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
    const userRepository = this._repository().user

    const data = await this.getById(id, { ...options })

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
    const newData = await userRepository.save(newFormData)

    // @ts-expect-error
    return newData
  }

  /**
   *
   * @param id
   * @param formData
   * @param options
   */
  public static async changePassword(
    id: string,
    formData: Partial<UserAttributes>,
    options?: ReqOptions
  ): Promise<void> {
    const userRepository = AppDataSource.getRepository(User)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const value = userSchema.changePassword.validateSync(formData, optionsYup)

    const newId = validateUUID(id, { ...options })
    const getUser = await userRepository.findOne({
      select: ['id', 'email', 'isActive', 'password', 'RoleId'],
      where: { id: newId },
    })

    // check user account
    if (!getUser) {
      const message = i18nConfig.t('errors.account_not_found', i18nOpt)
      throw new ResponseError.NotFound(message)
    }

    const matchPassword = await getUser.comparePassword(value.currentPassword)

    // compare password
    if (!matchPassword) {
      const message = i18nConfig.t('errors.incorrect_current_pass', i18nOpt)
      throw new ResponseError.BadRequest(message)
    }

    // update password
    await userRepository.save({
      ...getUser,
      password: value.confirmNewPassword,
    })
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const userRepository = this._repository().user

    const data = await this.getById(id, { ...options, withDeleted: true })

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
    const userRepository = this._repository().user

    const data = await this.getById(id, options)

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
    const userRepository = this._repository().user

    const data = await this.getById(id, options)

    await userRepository.delete(data.id)
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
    const userRepository = this._repository().user

    this._validateGetByIds(ids, options)

    await userRepository.restore({ id: In(ids) })
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
    const userRepository = this._repository().user

    this._validateGetByIds(ids, options)

    await userRepository.softDelete({ id: In(ids) })
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
    const userRepository = this._repository().user

    this._validateGetByIds(ids, options)

    await userRepository.delete({ id: In(ids) })
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
    const userRepository = this._repository().user
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await userRepository.findOne({
      where: { email },
    })

    if (data) {
      const message = i18nConfig.t('errors.already_email', i18nOpt)
      throw new ResponseError.BadRequest(message)
    }
  }
}
