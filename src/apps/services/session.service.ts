import { subDays } from 'date-fns'
import { type Request } from 'express'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import { LessThanOrEqual, type FindOneOptions, type Repository } from 'typeorm'
import sessionSchema from '~/apps/schemas/session.schema'
import { APP_LANG } from '~/config/env'
import { i18nConfig } from '~/config/i18n'
import { validateUUID } from '~/core/helpers/formatter'
import { optionsYup } from '~/core/helpers/yup'
import { useQuery } from '~/core/hooks/useQuery'
import { type DtoFindAll } from '~/core/interface/Paginate'
import { type ReqOptions } from '~/core/interface/ReqOptions'
import ResponseError from '~/core/modules/response/ResponseError'
import { AppDataSource } from '~/database/data-source'
import { Session, type SessionAttributes } from '~/database/entities/Session'

interface SessionRepository {
  sessionRepo: Repository<Session>
}

export default class SessionService {
  private static readonly _entity = 'Session'

  /**
   * Collect Repository
   * @returns
   */
  private static _repository(): SessionRepository {
    const sessionRepo = AppDataSource.getRepository(Session)

    return { sessionRepo }
  }

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Session>> {
    // declare repository
    const { sessionRepo } = this._repository()

    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    // create query builder
    const query = sessionRepo.createQueryBuilder()

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
  ): Promise<Session> {
    const { sessionRepo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await sessionRepo.findOne({
      where: options.where,
      relations: options.relations,
      withDeleted: options.withDeleted,
    })

    if (!data) {
      const options = { ...i18nOpt, entity: 'session' }
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
  ): Promise<Session> {
    const newId = validateUUID(id, { ...options })
    const data = await this._findOne<Session>({
      where: { id: newId },
      lang: options?.lang,
    })

    return data
  }

  /**
   *
   * @param UserId
   * @param token
   * @param options
   * @returns
   */
  public static async findByUserToken(
    UserId: string,
    token: string,
    options?: ReqOptions
  ): Promise<Session> {
    const { sessionRepo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await sessionRepo.findOne({ where: { UserId, token } })

    if (!data) {
      const message = i18nConfig.t('errors_ended', i18nOpt)
      throw new ResponseError.Unauthorized(message)
    }

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: SessionAttributes): Promise<Session> {
    const { sessionRepo } = this._repository()
    const newEntity = new Session()

    const value = sessionSchema.create.validateSync(formData, optionsYup)

    // @ts-expect-error
    const data = await sessionRepo.save({ ...newEntity, ...value })

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
    formData: SessionAttributes,
    options?: ReqOptions
  ): Promise<Session | undefined> {
    const { sessionRepo } = this._repository()
    const data = await this.findById(id, options)

    const value = sessionSchema.create.validateSync(formData, optionsYup)

    // @ts-expect-error
    const newData = await sessionRepo.save({ ...data, ...value })

    // @ts-expect-error
    return newData
  }

  /**
   *
   * @param formData
   */
  public static async createOrUpdate(
    formData: SessionAttributes
  ): Promise<void> {
    const { sessionRepo } = this._repository()

    const value = sessionSchema.create.validateSync(formData, optionsYup)

    const data = await sessionRepo.findOne({
      where: { UserId: value.UserId },
    })

    if (!data) {
      // create
      await this.create(formData)
    } else {
      // @ts-expect-error
      await sessionRepo.save({ ...data, ...value })
    }
  }

  /**
   *
   * @param UserId
   * @param token
   */
  public static async deleteByUserToken(
    UserId: string,
    token: string
  ): Promise<void> {
    const { sessionRepo } = this._repository()

    // delete record
    await sessionRepo.delete({ UserId, token })
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async delete(id: string, options?: ReqOptions): Promise<void> {
    const { sessionRepo } = this._repository()

    const data = await this.findById(id, options)

    await sessionRepo.delete(data.id)
  }

  /**
   * Delete Expired Session
   */
  public static async deleteExpiredSession(): Promise<void> {
    const { sessionRepo } = this._repository()
    const subSevenDays = subDays(new Date(), 7)

    const condition = {
      createdAt: LessThanOrEqual(subSevenDays),
    }

    const getSession = await sessionRepo.find({ where: condition })

    if (!_.isEmpty(getSession)) {
      // remove session
      await sessionRepo.delete(condition)
    }
  }

  /**
   *
   * @param token
   * @returns
   */
  public static async getByToken(token: string): Promise<Session[]> {
    const { sessionRepo } = this._repository()

    const data = await sessionRepo.find({
      where: { token },
    })

    return data
  }
}
