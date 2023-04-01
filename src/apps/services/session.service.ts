import { SessionRepository } from '@apps/repositories/session.repository'
import sessionSchema from '@apps/schemas/session.schema'
import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18n'
import { validateUUID } from '@core/helpers/formatter'
import { optionsYup } from '@core/helpers/yup'
import { type DtoFindAll } from '@core/interface/Paginate'
import { type ReqOptions } from '@core/interface/ReqOptions'
import { AppDataSource } from '@database/data-source'
import { Session, type SessionAttributes } from '@database/entities/Session'
import { subDays } from 'date-fns'
import { type Request } from 'express'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import { LessThanOrEqual } from 'typeorm'

const sessionRepository = new SessionRepository({
  entity: 'Session',
  repository: AppDataSource.getRepository(Session),
})

export default class SessionService {
  private static readonly _repository = sessionRepository

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Session>> {
    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = this._repository.findQuery(reqQuery)

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
  public static async findById(
    id: string,
    options?: ReqOptions
  ): Promise<Session> {
    const newId = validateUUID(id, { ...options })
    const data = await this._repository.findById(newId, options)

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
    const newId = validateUUID(UserId, { ...options })
    const data = await this._repository.findByUserToken(newId, token, options)

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: SessionAttributes): Promise<Session> {
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
    formData: SessionAttributes,
    options?: ReqOptions
  ): Promise<Session | undefined> {
    const newData = await this._repository.update(id, formData, options)

    return newData
  }

  /**
   *
   * @param formData
   */
  public static async createOrUpdate(
    formData: SessionAttributes
  ): Promise<void> {
    const value = sessionSchema.create.validateSync(formData, optionsYup)

    const data = await this._repository.findOne({
      where: { UserId: value.UserId },
    })

    if (!data) {
      // create
      await this.create(formData)
    } else {
      // update
      await this._repository.save({ ...data, ...value })
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
    const newRepository = this._repository.repository()

    // delete record
    await newRepository.delete({ UserId, token })
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async delete(id: string, options?: ReqOptions): Promise<void> {
    const data = await this.findById(id, options)

    await this._repository.forceDelete(data.id)
  }

  /**
   * Delete Expired Session
   */
  public static async deleteExpiredSession(): Promise<void> {
    const newRepository = this._repository.repository()
    const subSevenDays = subDays(new Date(), 7)

    const condition = {
      createdAt: LessThanOrEqual(subSevenDays),
    }

    const getSession = await sessionRepository.find({ where: condition })

    if (!_.isEmpty(getSession)) {
      // remove session
      await newRepository.delete(condition)
    }
  }
}
