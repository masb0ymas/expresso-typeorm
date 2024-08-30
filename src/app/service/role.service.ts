import { Role, RoleAttributes } from '~/database/entities/Role'
import BaseService from './base.service'
import roleSchema from '../schema/role.schema'

export default class RoleService extends BaseService<Role> {
  constructor() {
    super({ tableName: 'role', entity: Role })
  }

  /**
   *
   * @param formData
   * @returns
   */
  public async create(formData: RoleAttributes) {
    const newEntity = new Role()
    const value = roleSchema.create.parse(formData)

    const data = await this.repository.save({ ...newEntity, ...value })
    return data
  }
}
