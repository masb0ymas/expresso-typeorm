import { Request } from 'express'
import { TOptions } from 'i18next'
import _ from 'lodash'
import {
  EntityTarget,
  FindOneOptions,
  In,
  ObjectLiteral,
  Repository,
} from 'typeorm'
import { i18n } from '~/config/i18n'
import { IReqOptions } from '~/core/interface/ReqOptions'
import { useQuery } from '~/core/modules/hooks/useQuery'
import ErrorResponse from '~/core/modules/response/ErrorResponse'
import { validateUUID } from '~/core/utils/uuid'
import { AppDataSource } from '~/database/datasource'

interface IBaseService<T> {
  tableName: string
  entity: EntityTarget<T>
}

export default class BaseService<T extends ObjectLiteral> {
  private readonly _tableName: string
  public repository: Repository<T>

  /**
   *
   * @param params
   */
  constructor(params: IBaseService<T>) {
    this._tableName = params.tableName
    this.repository = AppDataSource.getRepository(params.entity)
  }

  /**
   *
   * @param req
   * @returns
   */
  public async findAll(req: Request) {
    const reqQuery = req.getQuery()

    const query = this.repository.createQueryBuilder(this._tableName)
    const newQuery = useQuery({ entity: this._tableName, query, reqQuery })

    const data = await newQuery.getMany()
    const total = await newQuery.getCount()

    const message = `${total} data has been received`
    return { data, total, message }
  }

  /**
   *
   * @param options
   * @returns
   */
  private async _findOne(options: FindOneOptions<T>) {
    const data = await this.repository.findOne({
      where: options.where,
      relations: options.relations,
      withDeleted: options.withDeleted,
    })

    const entity = this._tableName.replace('_', ' ')

    if (!data) {
      const message = `${entity} not found or has been deleted`
      throw new ErrorResponse.NotFound(message)
    }

    return data
  }

  /**
   *
   * @param id
   * @returns
   */
  public async findById(id: string, options?: IReqOptions) {
    const newId = validateUUID(id)

    // @ts-expect-error
    const data = await this._findOne({ ...options, where: { id: newId } })

    return data
  }

  /**
   *
   * @param id
   * @param formData
   * @returns
   */
  public async update(id: string, formData: any, options?: IReqOptions) {
    const getOne = await this.findById(id, options)

    const data = await this.repository.save({ ...getOne, ...formData })
    return data
  }

  /**
   *
   * @param id
   * @param options
   */
  public async restore(id: string, options?: IReqOptions) {
    const data = await this.findById(id, { ...options, withDeleted: true })

    await this.repository.restore(data.id)
  }

  /**
   *
   * @param id
   */
  public async softDelete(id: string, options?: IReqOptions) {
    const data = await this.findById(id, options)

    await this.repository.softDelete(data.id)
  }

  /**
   *
   * @param id
   */
  public async forceDelete(id: string, options?: IReqOptions) {
    const data = await this.findById(id, options)

    await this.repository.delete(data.id)
  }

  /**
   *
   * @param ids
   */
  private async _validateIds(ids: string[], options?: IReqOptions) {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    if (_.isEmpty(ids)) {
      const message = i18n.t('errors.cant_be_empty', i18nOpt)
      throw new ErrorResponse.BadRequest(`ids ${message}`)
    }
  }

  /**
   *
   * @param ids
   */
  public async multipleRestore(ids: string[], options?: IReqOptions) {
    // validate
    this._validateIds(ids, options)

    // @ts-expect-error
    this.repository.restore({ id: In(ids) })
  }

  /**
   *
   * @param ids
   */
  public async multipleSoftDelete(ids: string[], options?: IReqOptions) {
    // validate
    this._validateIds(ids, options)

    // @ts-expect-error
    this.repository.softDelete({ id: In(ids) })
  }

  /**
   *
   * @param ids
   */
  public async multipleForceDelete(ids: string[], options?: IReqOptions) {
    // validate
    this._validateIds(ids, options)

    // @ts-expect-error
    this.repository.delete({ id: In(ids) })
  }
}
