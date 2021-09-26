import { Role, RolePost } from '@entity/Role'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
import { getRepository } from 'typeorm'
import roleSchema from './schema'

interface DtoPaginate {
  data: Role[]
  total: number
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

    return { data, total }
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
  public static async created(formData: RolePost): Promise<Role> {
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
  public static async updated(id: string, formData: RolePost): Promise<Role> {
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
  public static async deleted(id: string): Promise<void> {
    const roleRepository = getRepository(Role)
    const data = await this.findById(id)

    await roleRepository.delete(data.id)
  }
}

export default RoleService
