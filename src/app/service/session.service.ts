import { subDays } from 'date-fns'
import { type Request } from 'express'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import { LessThanOrEqual, type FindOneOptions, type Repository } from 'typeorm'
import { env } from '~/config/env'
import { i18n } from '~/config/i18n'
import { type IReqOptions } from '~/core/interface/ReqOptions'
import { type DtoFindAll } from '~/core/interface/dto/Paginate'
import { useQuery } from '~/core/modules/hooks/useQuery'
import ResponseError from '~/core/modules/response/ResponseError'
import { validateUUID } from '~/core/utils/formatter'
import { yupOptions } from '~/core/utils/yup'
import { AppDataSource } from '~/database/data-source'
import { Session, type SessionAttributes } from '~/database/entities/Session'
import sessionSchema from '../schema/session.schema'

interface SessionRepository {
  sessionRepo: Repository<Session>
}

export default class SessionService {
  private static readonly _entity = 'session'

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

    const defaultLang = reqQuery.lang ?? env.APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    // create query builder
    const query = sessionRepo.createQueryBuilder(this._entity)

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
   * @param user_id
   * @param token
   * @param options
   * @returns
   */
  public static async findByUserToken(
    user_id: string,
    token: string,
    options?: IReqOptions
  ): Promise<Session> {
    const { sessionRepo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await sessionRepo.findOne({ where: { user_id, token } })

    if (!data) {
      const message = i18n.t('errors_ended', i18nOpt)
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

    const value = sessionSchema.create.validateSync(formData, yupOptions)

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
    options?: IReqOptions
  ): Promise<Session | undefined> {
    const { sessionRepo } = this._repository()
    const data = await this.findById(id, options)

    const value = sessionSchema.create.validateSync(formData, yupOptions)

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

    const value = sessionSchema.create.validateSync(formData, yupOptions)

    const data = await sessionRepo.findOne({
      where: { user_id: value.user_id },
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
   * @param user_id
   * @param token
   */
  public static async deleteByUserToken(
    user_id: string,
    token: string
  ): Promise<void> {
    const { sessionRepo } = this._repository()

    // delete record
    await sessionRepo.delete({ user_id, token })
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async delete(id: string, options?: IReqOptions): Promise<void> {
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
      created_at: LessThanOrEqual(subSevenDays),
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
