import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18nextConfig'
import { AppDataSource } from '@database/data-source'
import { Session, SessionAttributes } from '@database/entities/Session'
import { validateUUID } from '@expresso/helpers/Formatter'
import { optionsYup } from '@expresso/helpers/Validation'
import { useQuery } from '@expresso/hooks/useQuery'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import { ReqOptions } from '@expresso/interfaces/ReqOptions'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { subDays } from 'date-fns'
import { Request } from 'express'
import { TOptions } from 'i18next'
import _ from 'lodash'
import { LessThanOrEqual } from 'typeorm'
import sessionSchema from './schema'

class SessionService {
  private static readonly entity = 'Session'

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Session>> {
    const sessionRepository = AppDataSource.getRepository(Session)
    const { lang } = req.getQuery()

    const defaultLang = lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = sessionRepository
      .createQueryBuilder()
      .leftJoinAndSelect(`${this.entity}.User`, 'User')
    const newQuery = useQuery({ entity: this.entity, query, req })

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
  ): Promise<Session> {
    const sessionRepository = AppDataSource.getRepository(Session)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const newId = validateUUID(id, { ...options })
    const data = await sessionRepository.findOne({ where: { id: newId } })

    if (!data) {
      const message = i18nConfig.t('errors.not_found', i18nOpt)
      throw new ResponseError.NotFound(`session ${message}`)
    }

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
    options?: ReqOptions
  ): Promise<Session> {
    const sessionRepository = AppDataSource.getRepository(Session)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await sessionRepository.findOne({ where: { user_id, token } })

    if (!data) {
      const message = i18nConfig.t('errors.session_ended', i18nOpt)
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
    const sessionRepository = AppDataSource.getRepository(Session)
    const data = new Session()

    const value = sessionSchema.create.validateSync(formData, optionsYup)
    const newData = await sessionRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param formData
   */
  public static async createOrUpdate(
    formData: SessionAttributes
  ): Promise<void> {
    const sessionRepository = AppDataSource.getRepository(Session)

    const value = sessionSchema.create.validateSync(formData, optionsYup)

    const data = await sessionRepository.findOne({
      where: { user_id: value.user_id },
    })

    if (!data) {
      // create
      await this.create(formData)
    } else {
      // update
      await sessionRepository.save({ ...data, ...value })
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
    const sessionRepository = AppDataSource.getRepository(Session)

    // delete record
    await sessionRepository.delete({ user_id, token })
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async delete(id: string, options?: ReqOptions): Promise<void> {
    const sessionRepository = AppDataSource.getRepository(Session)

    const data = await this.findById(id, { ...options })
    await sessionRepository.delete(data.id)
  }

  /**
   * Delete Expired Session
   */
  public static async deleteExpiredSession(): Promise<void> {
    const sessionRepository = AppDataSource.getRepository(Session)

    const subSevenDays = subDays(new Date(), 7)

    const condition = {
      created_at: LessThanOrEqual(subSevenDays),
    }

    const getSession = await sessionRepository.find({ where: condition })

    if (!_.isEmpty(getSession)) {
      // remove session
      await sessionRepository.delete(condition)
    }
  }
}

export default SessionService
