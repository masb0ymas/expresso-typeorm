import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18nextConfig'
import { Session, SessionAttributes } from '@database/entities/Session'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import { ReqOptions } from '@expresso/interfaces/ReqOptions'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { queryFiltered } from '@expresso/modules/TypeORMQuery'
import { Request } from 'express'
import { TOptions } from 'i18next'
import { getRepository } from 'typeorm'
import sessionSchema from './schema'

interface DtoPaginate extends DtoFindAll {
  data: Session[]
}

class SessionService {
  private static readonly entity = 'Session'

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoPaginate> {
    const sessionRepository = getRepository(Session)
    const { lang } = req.getQuery()

    const defaultLang = lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = sessionRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Session.User', 'User')
    const newQuery = queryFiltered(this.entity, query, req)

    const data = await newQuery
      .orderBy(`${this.entity}.createdAt`, 'DESC')
      .getMany()
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
    const sessionRepository = getRepository(Session)
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
    const sessionRepository = getRepository(Session)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await sessionRepository.findOne({ where: { UserId, token } })

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
    const sessionRepository = getRepository(Session)

    const value = useValidation(sessionSchema.create, formData)

    const data = new Session()
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
    const sessionRepository = getRepository(Session)
    const value = useValidation(sessionSchema.create, formData)

    const data = await sessionRepository.findOne({
      where: { UserId: value.UserId },
    })

    if (!data) {
      await this.create(formData)
    } else {
      await sessionRepository.save({ ...data, ...value })
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
    const sessionRepository = getRepository(Session)

    // delete record
    await sessionRepository.delete({ UserId, token })
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async delete(id: string, options?: ReqOptions): Promise<void> {
    const sessionRepository = getRepository(Session)

    const data = await this.findById(id, { ...options })
    await sessionRepository.delete(data.id)
  }
}

export default SessionService
