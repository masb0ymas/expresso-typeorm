import { Role, RoleAttributes } from '@database/entities/Role'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { queryFiltered } from '@expresso/modules/TypeORMQuery'
import { Request } from 'express'
import _ from 'lodash'
import { getRepository } from 'typeorm'
import roleSchema from './schema'

interface DtoPaginate extends DtoFindAll {
  data: Role[]
}

class RoleService {
  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoPaginate> {
    const roleRepository = getRepository(Role)

    const query = roleRepository.createQueryBuilder()
    const newQuery = queryFiltered(query, req)

    const data = await newQuery.orderBy('Role.createdAt', 'DESC').getMany()
    const total = await newQuery.getCount()

    return { message: `${total} data has been received.`, data, total }
  }

  /**
   *
   * @param id
   * @returns
   */
  public static async findById(id: string): Promise<Role> {
    const roleRepository = getRepository(Role)

    const newId = validateUUID(id)
    const data = await roleRepository.findOne(newId)

    if (!data) {
      throw new ResponseError.NotFound(
        'role data not found or has been deleted'
      )
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
   * @returns
   */
  public static async update(
    id: string,
    formData: Partial<RoleAttributes>
  ): Promise<Role> {
    const roleRepository = getRepository(Role)
    const data = await this.findById(id)

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
   */
  public static async restore(id: string): Promise<void> {
    const roleRepository = getRepository(Role)

    const newId = validateUUID(id)
    await roleRepository.restore(newId)
  }

  /**
   *
   * @param id
   */
  public static async softDelete(id: string): Promise<void> {
    const roleRepository = getRepository(Role)

    const data = await this.findById(id)
    await roleRepository.softDelete(data.id)
  }

  /**
   *
   * @param id
   */
  public static async forceDelete(id: string): Promise<void> {
    const roleRepository = getRepository(Role)
    const data = await this.findById(id)

    await roleRepository.delete(data.id)
  }

  /**
   * Multiple Force Delete
   * @param ids
   */
  public static async multipleRestore(ids: string[]): Promise<void> {
    const userRepository = getRepository(Role)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('id IN (:...ids)', { ids: [...ids] })
      .restore()
      .execute()
  }

  /**
   * Multiple Soft Delete
   * @param ids
   */
  public static async multipleSoftDelete(ids: string[]): Promise<void> {
    const userRepository = getRepository(Role)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('id IN (:...ids)', { ids: [...ids] })
      .softDelete()
      .execute()
  }

  /**
   * Multiple Force Delete
   * @param ids
   */
  public static async multipleForceDelete(ids: string[]): Promise<void> {
    const userRepository = getRepository(Role)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('id IN (:...ids)', { ids: [...ids] })
      .delete()
      .execute()
  }
}

export default RoleService
