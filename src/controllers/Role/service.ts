import { Role } from '@entity/Role'
import 'reflect-metadata'
import { getRepository } from 'typeorm'

class RoleService {
  public static async getAll(): Promise<Role[]> {
    const data = await getRepository(Role).find()

    return data
  }

  public static async created(formData: any): Promise<Role> {
    const roleRepository = getRepository(Role)

    const data = new Role()
    data.name = formData.name
    await roleRepository.save(data)

    return data
  }
}

export default RoleService
