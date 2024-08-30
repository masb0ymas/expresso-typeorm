import { Request } from 'express'
import { TOptions } from 'i18next'
import { env } from '~/config/env'
import { i18n } from '~/config/i18n'
import { IReqOptions } from '~/core/interface/ReqOptions'
import { useQuery } from '~/core/modules/hooks/useQuery'
import ErrorResponse from '~/core/modules/response/ErrorResponse'
import { validateUUID } from '~/core/utils/uuid'
import { User, UserAttributes } from '~/database/entities/User'
import userSchema from '../schema/user.schema'
import BaseService from './base.service'

export default class UserService extends BaseService<User> {
  constructor() {
    super({ tableName: 'user', entity: User })
  }

  /**
   *
   * @param req
   * @returns
   */
  public async findAll(
    req: Request
  ): Promise<{ data: User[]; total: number; message: string }> {
    // OVERRIDE FIND ALL
    await super.findAll(req)

    const reqQuery = req.getQuery()
    const defaultLang = reqQuery.lang ?? env.APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = this.repository
      .createQueryBuilder(this.tableName)
      .leftJoinAndSelect(`${this.tableName}.role`, 'role')
      .leftJoinAndSelect(`${this.tableName}.upload`, 'upload')
      .leftJoinAndSelect(`${this.tableName}.sessions`, 'session')

    const newQuery = useQuery({ entity: this.tableName, query, reqQuery })

    const data = await newQuery.getMany()
    const total = await newQuery.getCount()

    const message = i18n.t('success.data_received', i18nOpt)
    return { message: `${total} ${message}`, data, total }
  }

  /**
   *
   * @param id
   * @param options
   * @returns
   */
  public async findById(id: string, options?: IReqOptions): Promise<User> {
    // OVERRIDE FIND BY ID
    await super.findById(id, options)

    const newId = validateUUID(id, options)
    const data = await this._findOne({
      ...options,
      where: { id: newId },
      relations: ['role', 'upload', 'sessions'],
    })

    return data
  }

  /**
   *
   * @param email
   * @param options
   */
  public async validateEmail(
    email: string,
    options?: IReqOptions
  ): Promise<void> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await this.repository.findOne({
      where: { email },
    })

    if (data) {
      const message = i18n.t('errors.already_email', i18nOpt)
      throw new ErrorResponse.BadRequest(message)
    }
  }

  /**
   *
   * @param formData
   * @returns
   */
  public async create(formData: UserAttributes) {
    const newEntity = new User()
    const value = userSchema.create.parse(formData)

    // @ts-expect-error
    const data = await this.repository.save({ ...newEntity, ...value })
    return data
  }

  /**
   *
   * @param id
   * @param formData
   * @param options
   */
  public async changePassword(
    id: string,
    formData: Partial<UserAttributes>,
    options?: IReqOptions
  ): Promise<void> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const value = userSchema.changePassword.parse(formData)

    const newId = validateUUID(id, { ...options })
    const getUser = await this.repository.findOne({
      select: ['id', 'email', 'is_active', 'password', 'role_id'],
      where: { id: newId },
    })

    // check user account
    if (!getUser) {
      const message = i18n.t('errors.account_not_found', i18nOpt)
      throw new ErrorResponse.NotFound(message)
    }

    const matchPassword = await getUser.comparePassword(value.current_password)

    // compare password
    if (!matchPassword) {
      const message = i18n.t('errors.incorrect_current_pass', i18nOpt)
      throw new ErrorResponse.BadRequest(message)
    }

    // update password
    await this.repository.save({
      ...getUser,
      password: value.confirm_new_password,
    })
  }
}
