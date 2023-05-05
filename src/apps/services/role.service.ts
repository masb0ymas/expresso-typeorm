import { type Request } from 'express'
import { type TOptions } from 'i18next'
import _ from 'lodash'
import { In, type FindOneOptions, type Repository } from 'typeorm'
import roleSchema from '~/apps/schemas/role.schema'
import { APP_LANG } from '~/config/env'
import { i18nConfig } from '~/config/i18n'
import { validateUUID } from '~/core/helpers/formatter'
import { optionsYup } from '~/core/helpers/yup'
import { useQuery } from '~/core/hooks/useQuery'
import { type DtoFindAll } from '~/core/interface/Paginate'
import { type ReqOptions } from '~/core/interface/ReqOptions'
import ResponseError from '~/core/modules/response/ResponseError'
import { AppDataSource } from '~/database/data-source'
import { Role, type RoleAttributes } from '~/database/entities/Role'

interface RoleRepository {
  roleRepo: Repository<Role>
}

export default class RoleService {
  private static readonly _entity = 'Role'

  /**
   * Collect Repository
   * @returns
   */
  private static _repository(): RoleRepository {
    const roleRepo = AppDataSource.getRepository(Role)

    return { roleRepo }
  }

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoFindAll<Role>> {
    // declare repository
    const { roleRepo } = this._repository()

    const reqQuery = req.getQuery()

    const defaultLang = reqQuery.lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    // create query builder
    const query = roleRepo.createQueryBuilder()

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
  ): Promise<Role> {
    const { roleRepo } = this._repository()
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await roleRepo.findOne({
      where: options.where,
      relations: options.relations,
      withDeleted: options.withDeleted,
    })

    if (!data) {
      const options = { ...i18nOpt, entity: 'role' }
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
  ): Promise<Role> {
    const newId = validateUUID(id, { ...options })
    const data = await this._findOne<Role>({
      where: { id: newId },
      lang: options?.lang,
    })

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: RoleAttributes): Promise<Role> {
    const { roleRepo } = this._repository()
    const newEntity = new Role()

    const value = roleSchema.create.validateSync(formData, optionsYup)
    const data = await roleRepo.save({ ...newEntity, ...value })

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
  ): Promise<Role> {
    const { roleRepo } = this._repository()
    const data = await this.findById(id, options)

    const value = roleSchema.create.validateSync(formData, optionsYup)
    const newData = await roleRepo.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const { roleRepo } = this._repository()

    const data = await this.findById(id, { ...options, withDeleted: true })

    await roleRepo.restore(data.id)
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
    const { roleRepo } = this._repository()

    const data = await this.findById(id, options)

    await roleRepo.softDelete(data.id)
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
    const { roleRepo } = this._repository()

    const data = await this.findById(id, options)

    await roleRepo.delete(data.id)
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
    const { roleRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await roleRepo.restore({ id: In(ids) })
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
    const { roleRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await roleRepo.softDelete({ id: In(ids) })
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
    const { roleRepo } = this._repository()

    this._validateGetByIds(ids, options)

    await roleRepo.delete({ id: In(ids) })
  }
}
