import { RoleRepository } from '@apps/repositories/role.repository'
import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18n'
import { validateUUID } from '@core/helpers/formatter'
import { type DtoFindAll } from '@core/interface/Paginate'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { AppDataSource } from '@database/data-source'
import { Role, type RoleAttributes } from '@database/entities/Role'
import { type Request } from 'express'
import { type TOptions } from 'i18next'
import _ from 'lodash'

const roleRepository = new RoleRepository({
  entity: 'Role',
  repository: AppDataSource.getRepository(Role),
})

export default class RoleService {
  private static readonly _repository = roleRepository

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Role>> {
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
  ): Promise<Role> {
    const newId = validateUUID(id, { ...options })
    const data = await this._repository.findById(newId, options)

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: RoleAttributes): Promise<Role> {
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
    formData: RoleAttributes,
    options?: ReqOptions
  ): Promise<Role | undefined> {
    const newData = await this._repository.update(id, formData, options)

    return newData
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const data = await this.findById(id, { withDeleted: true, ...options })

    await this._repository.restore(data.id)
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
    const data = await this.findById(id, options)

    await this._repository.softDelete(data.id)
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
    const data = await this.findById(id, options)

    await this._repository.forceDelete(data.id)
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
    this._validateGetByIds(ids, options)

    await this._repository.multipleRestore(ids)
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
    this._validateGetByIds(ids, options)

    await this._repository.multipleSoftDelete(ids)
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
    this._validateGetByIds(ids, options)

    await this._repository.multipleForceDelete(ids)
  }
}
