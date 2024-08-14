import { Role, RoleAttributes } from '~/database/entities/Role'
import BaseService from './base.service'

export default class RoleService extends BaseService<Role> {
  /**
   *
   * @param formData
   * @returns
   */
  public async create(formData: RoleAttributes) {
    const newEntity = new Role()

    const data = await this.repository.save({ ...newEntity, ...formData })
    return data
  }
}
