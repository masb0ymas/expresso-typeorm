import { type Request } from 'express'
import { validateEmpty } from 'expresso-core'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import { In, type FindOneOptions, type Repository } from 'typeorm'
import userSchema from '~/apps/schemas/user.schema'
import { APP_LANG } from '~/config/env'
import { i18nConfig } from '~/config/i18n'
import { validateUUID } from '~/core/helpers/formatter'
import { optionsYup } from '~/core/helpers/yup'
import { useQuery } from '~/core/hooks/useQuery'
import { type DtoFindAll } from '~/core/interface/Paginate'
import { type ReqOptions } from '~/core/interface/ReqOptions'
import ResponseError from '~/core/modules/response/ResponseError'
import { AppDataSource } from '~/database/data-source'
import { User, type UserAttributes } from '~/database/entities/User'

interface UserRepository {
  userRepo: Repository<User>
}

export default class UserService {
  private static readonly _entity = 'User'

  /**
   * Collect Repository
   * @returns
   */
  private static _repository(): UserRepository {
    const userRepo = AppDataSource.getRepository(User)

    return { userRepo }
  }

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<User>> {
    // declare repository
    const { userRepo } = this._repository()

    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    // create query builder
    const query = userRepo.createQueryBuilder()

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
    const { userRepo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await userRepo.findOne({
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
    const { userRepo } = this._repository()
    const newEntity = new User()

    const value = userSchema.create.validateSync(formData, optionsYup)

    const newFormData = {
      ...newEntity,
      ...value,
      phone: validateEmpty(value?.phone),
      password: validateEmpty(value?.confirmNewPassword),
    }

    // @ts-expect-error
    const data = await userRepo.save(newFormData)

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
    const { userRepo } = this._repository()

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
    const newData = await userRepo.save(newFormData)

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
    const { userRepo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const value = userSchema.changePassword.validateSync(formData, optionsYup)

    const newId = validateUUID(id, { ...options })
    const getUser = await userRepo.findOne({
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
    await userRepo.save({
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
    const { userRepo } = this._repository()

    const data = await this.getById(id, { ...options, withDeleted: true })

    await userRepo.restore(data.id)
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
    const { userRepo } = this._repository()

    const data = await this.getById(id, options)

    await userRepo.softDelete(data.id)
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
    const { userRepo } = this._repository()

    const data = await this.getById(id, options)

    await userRepo.delete(data.id)
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
    const { userRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await userRepo.restore({ id: In(ids) })
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
    const { userRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await userRepo.softDelete({ id: In(ids) })
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
    const { userRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await userRepo.delete({ id: In(ids) })
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
    const { userRepo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await userRepo.findOne({
      where: { email },
    })

    if (data) {
      const message = i18nConfig.t('errors.already_email', i18nOpt)
      throw new ResponseError.BadRequest(message)
    }
  }
}
