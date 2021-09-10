import { Role, RolePost } from '@entity/Role'
import useValidation from '@expresso/hooks/useValidation'
import ResponseError from '@expresso/modules/Response/ResponseError'
import 'reflect-metadata'
import { getRepository } from 'typeorm'
import roleSchema from './schema'

class RoleService {
  public static async getAll(): Promise<Role[]> {
    const data = await getRepository(Role).find()

    return data
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

    await roleRepository.update(id, value)

    return data
  }
}

export default RoleService
