import { Role, RoleAttributes } from '@database/entity/Role'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
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

    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10

    const data = await roleRepository
      .createQueryBuilder()
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany()

    const total = await roleRepository.createQueryBuilder().getCount()

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
}

export default RoleService
