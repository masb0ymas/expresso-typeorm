import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18nextConfig'
import { Role, RoleAttributes } from '@database/entities/Role'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import { ReqOptions } from '@expresso/interfaces/ReqOptions'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { queryFiltered } from '@expresso/modules/TypeORMQuery'
import { Request } from 'express'
import { TOptions } from 'i18next'
import _ from 'lodash'
import { getRepository } from 'typeorm'
import roleSchema from './schema'

interface DtoPaginate extends DtoFindAll {
  data: Role[]
}

class RoleService {
  private static readonly entity = 'Role'

  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoPaginate> {
    const roleRepository = getRepository(Role)
    const { lang } = req.getQuery()

    const defaultLang = lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const query = roleRepository.createQueryBuilder()
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
  ): Promise<Role> {
    const roleRepository = getRepository(Role)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const newId = validateUUID(id, { ...options })
    const data = await roleRepository.findOne({ where: { id: newId } })

    if (!data) {
      const message = i18nConfig.t('errors.not_found', i18nOpt)
      throw new ResponseError.NotFound(`role ${message}`)
    }

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: RoleAttributes): Promise<Role> {
    const roleRepository = getRepository(Role)
    const data = new Role()

    const value = useValidation(roleSchema.create, formData)
    const newData = await roleRepository.save({ ...data, ...value })

    return newData
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
    formData: Partial<RoleAttributes>,
    options?: ReqOptions
  ): Promise<Role> {
    const roleRepository = getRepository(Role)
    const data = await this.findById(id, { ...options })

    const value = useValidation(roleSchema.create, {
      ...data,
      ...formData,
    })

    const newData = await roleRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param id
   * @param options
   */
  public static async restore(id: string, options?: ReqOptions): Promise<void> {
    const roleRepository = getRepository(Role)

    const data = await this.findById(id, { ...options })
    await roleRepository.restore(data.id)
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
    const roleRepository = getRepository(Role)

    const data = await this.findById(id, { ...options })
    await roleRepository.softDelete(data.id)
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
    const roleRepository = getRepository(Role)

    const data = await this.findById(id, { ...options })
    await roleRepository.delete(data.id)
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
    const roleRepository = getRepository(Role)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    if (_.isEmpty(ids)) {
      const message = i18nConfig.t('errors.cant_be_empty', i18nOpt)
      throw new ResponseError.BadRequest(`ids ${message}`)
    }

    const query = roleRepository
      .createQueryBuilder()
      .where(`${this.entity}.id IN (:...ids)`, { ids: [...ids] })

    // restore record
    await query.restore().execute()
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
    const roleRepository = getRepository(Role)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    if (_.isEmpty(ids)) {
      const message = i18nConfig.t('errors.cant_be_empty', i18nOpt)
      throw new ResponseError.BadRequest(`ids ${message}`)
    }

    const query = roleRepository
      .createQueryBuilder()
      .where(`${this.entity}.id IN (:...ids)`, { ids: [...ids] })

    // soft delete record
    await query.softDelete().execute()
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
    const roleRepository = getRepository(Role)
    const i18nOpt: string | TOptions = { lng: options?.lang }

    if (_.isEmpty(ids)) {
      const message = i18nConfig.t('errors.cant_be_empty', i18nOpt)
      throw new ResponseError.BadRequest(`ids ${message}`)
    }

    const query = roleRepository
      .createQueryBuilder()
      .where(`${this.entity}.id IN (:...ids)`, { ids: [...ids] })

    // delete record
    await query.delete().execute()
  }
}

export default RoleService
