import { Role, RolePost } from '@entity/Role'
import useValidation from '@expresso/hooks/useValidation'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
import 'reflect-metadata'
import { getRepository } from 'typeorm'
import roleSchema from './schema'

interface RolePaginate {
  data: Role[]
  total: number
}

class RoleService {
  public static async getAll(req: Request): Promise<RolePaginate> {
    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10

    const data = await getRepository(Role)
      .createQueryBuilder()
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany()

    const total = await getRepository(Role).createQueryBuilder().getCount()

    return { data, total }
  }

  public static async getOne(id: string): Promise<Role> {
    const data = await getRepository(Role).findOne(id)

    if (!data) {
      throw new ResponseError.NotFound(
        'role data not found or has been deleted'
      )
    }

    return data
  }

  public static async created(formData: RolePost): Promise<Role> {
    const roleRepository = getRepository(Role)

    const value = useValidation(roleSchema.create, formData)

    const data = new Role()
    data.name = value.name
    await roleRepository.save(data)

    return data
  }

  public static async updated(id: string, formData: RolePost): Promise<Role> {
    const roleRepository = getRepository(Role)
    const data = await this.getOne(id)

    const value = useValidation(roleSchema.create, {
      ...data,
      ...formData,
    })

    const newData = await roleRepository.save({ ...data, ...value })

    return newData
  }

  public static async deleted(id: string): Promise<void> {
    const roleRepository = getRepository(Role)
    const data = await this.getOne(id)
    console.log({ data })

    await roleRepository.delete(id)
  }
}

export default RoleService
