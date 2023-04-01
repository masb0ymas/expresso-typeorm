import { TypeOrmRepository } from '@apps/interfaces/iRepository'
import sessionSchema from '@apps/schemas/session.schema'
import { i18nConfig } from '@config/i18n'
import { optionsYup } from '@core/helpers/yup'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { Session, type SessionAttributes } from '@database/entities/Session'
import { type TOptions } from 'i18next'

export class SessionRepository extends TypeOrmRepository<Session> {
  /**
   *
   * @param id
   * @param options
   * @returns
   */
  public async findById(id: string, options?: ReqOptions): Promise<Session> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await this.findOne({
      where: { id },
      withDeleted: options?.withDeleted,
    })

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
  public async findByUserToken(
    UserId: string,
    token: string,
    options?: ReqOptions
  ): Promise<Session> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await this.findOne({ where: { UserId, token } })

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
  public async create(formData: SessionAttributes): Promise<Session> {
    const newEntity = new Session()

    const value = sessionSchema.create.validateSync(formData, optionsYup)
    const data = await this.save({ ...newEntity, ...value })

    return data
  }

  /**
   *
   * @param id
   * @param formData
   * @param options
   * @returns
   */
  public async update(
    id: string,
    formData: SessionAttributes,
    options?: ReqOptions
  ): Promise<Session> {
    const data = await this.findById(id, options)

    const value = sessionSchema.create.validateSync(formData, optionsYup)
    const newData = await this.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param formData
   */
  public async createOrUpdate(formData: SessionAttributes): Promise<void> {
    const value = sessionSchema.create.validateSync(formData, optionsYup)

    const data = await this.findOne({
      where: { UserId: value.UserId },
    })

    if (!data) {
      // create
      await this.create(formData)
    } else {
      // update
      await this.save({ ...data, ...value })
    }
  }
}
