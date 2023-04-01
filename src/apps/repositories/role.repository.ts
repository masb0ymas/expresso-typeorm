import { TypeOrmRepository } from '@apps/interfaces/iRepository'
import roleSchema from '@apps/schemas/role.schema'
import { i18nConfig } from '@config/i18n'
import { optionsYup } from '@core/helpers/yup'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { Role, type RoleAttributes } from '@database/entities/Role'
import { type TOptions } from 'i18next'

export class RoleRepository extends TypeOrmRepository<Role> {
  /**
   *
   * @param id
   * @param options
   * @returns
   */
  public async findById(id: string, options?: ReqOptions): Promise<Role> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await this.findOne({
      where: { id },
      withDeleted: options?.withDeleted,
    })

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
  public async create(formData: RoleAttributes): Promise<Role> {
    const newEntity = new Role()

    const value = roleSchema.create.validateSync(formData, optionsYup)
    const data = await this.save({ ...newEntity, ...value })

    return data
  }

  /**
   *
   * @param id
   * @param formData
   * @param options
   * @returns
   */
  public async update(
    id: string,
    formData: RoleAttributes,
    options?: ReqOptions
  ): Promise<Role> {
    const data = await this.findById(id, options)

    const value = roleSchema.create.validateSync(formData, optionsYup)
    const newData = await this.save({ ...data, ...value })

    return newData
  }
}
