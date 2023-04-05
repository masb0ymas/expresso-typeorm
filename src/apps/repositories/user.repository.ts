import { TypeOrmRepository } from '@apps/interfaces/iRepository'
import userSchema from '@apps/schemas/user.schema'
import { i18nConfig } from '@config/i18n'
import { optionsYup } from '@core/helpers/yup'
import { type ReqOptions } from '@core/interface/ReqOptions'
import ResponseError from '@core/modules/response/ResponseError'
import { User, type UserAttributes } from '@database/entities/User'
import { validateEmpty } from 'expresso-core'
import { type TOptions } from 'i18next'

export class UserRepository extends TypeOrmRepository<User> {
  /**
   *
   * @param id
   * @param options
   * @returns
   */
  public async findById(id: string, options?: ReqOptions): Promise<User> {
    const i18nOpt: string | TOptions = { lng: options?.lang }

    const data = await this.findOne({
      where: { id },
      relations: options?.relations,
      withDeleted: options?.withDeleted,
    })

    if (!data) {
      const message = i18nConfig.t('errors.not_found', {
        ...i18nOpt,
        entity: 'user',
      })
      throw new ResponseError.NotFound(message)
    }

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public async create(formData: UserAttributes): Promise<User> {
    const newEntity = new User()

    const value = userSchema.create.validateSync(formData, optionsYup)

    const newFormData = {
      ...newEntity,
      ...value,
      phone: validateEmpty(value?.phone),
      password: validateEmpty(value?.confirmNewPassword),
    }

    // @ts-expect-error
    const data = await this.save(newFormData)

    return data
  }
}
