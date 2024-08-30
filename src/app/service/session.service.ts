import { subDays } from 'date-fns'
import { TOptions } from 'i18next'
import _ from 'lodash'
import { LessThanOrEqual } from 'typeorm'
import { i18n } from '~/config/i18n'
import { IReqOptions } from '~/core/interface/ReqOptions'
import ErrorResponse from '~/core/modules/response/ErrorResponse'
import { validateUUID } from '~/core/utils/uuid'
import { Session, SessionAttributes } from '~/database/entities/Session'
import sessionSchema from '../schema/session.schema'
import BaseService from './base.service'

export default class SessionService extends BaseService<Session> {
  constructor() {
    super({ tableName: 'session', entity: Session })
  }

  /**
   *
   * @param formData
   * @returns
   */
  public async create(formData: SessionAttributes) {
    const newEntity = new Session()
    const value = sessionSchema.create.parse(formData)

    // @ts-expect-error
    const data = await this.repository.save({ ...newEntity, ...value })
    return data
  }

  /**
   * Create or Update Session
   * @param formData
   */
  public async createOrUpdate(formData: SessionAttributes): Promise<void> {
    const value = sessionSchema.create.parse(formData)

    const data = await this.repository.findOne({
      where: { user_id: value.user_id },
    })

    if (!data) {
      // create
      await this.create(value)
    } else {
      // @ts-expect-error
      await this.repository.save({ ...data, ...value })
    }
  }

  /**
   *
   * @param user_id
   * @param token
   * @param options
   * @returns
   */
  public async findByUserToken(
    user_id: string,
    token: string,
    options?: IReqOptions
  ): Promise<Session> {
    const i18nOpt: string | TOptions = { lng: options?.lang }
    const newId = validateUUID(user_id, options)

    const data = await this.repository.findOne({
      where: { user_id: newId, token },
    })

    if (!data) {
      const message = i18n.t('errors_ended', i18nOpt)
      throw new ErrorResponse.Unauthorized(message)
    }

    return data
  }

  /**
   *
   * @param token
   * @returns
   */
  public async getByToken(token: string): Promise<Session | null> {
    const data = await this.repository.findOne({ where: { token } })

    return data
  }

  /**
   *
   * @param user_id
   * @param token
   */
  public async deleteByUserToken(
    user_id: string,
    token: string
  ): Promise<void> {
    // delete record
    await this.repository.delete({ user_id, token })
  }

  /**
   * Delete Expired Session
   */
  public async deleteExpiredSession(): Promise<void> {
    const subSevenDays = subDays(new Date(), 7)

    const condition = {
      created_at: LessThanOrEqual(subSevenDays),
    }

    const getSession = await this.repository.find({ where: condition })

    if (!_.isEmpty(getSession)) {
      // remove session
      await this.repository.delete(condition)
    }
  }
}
