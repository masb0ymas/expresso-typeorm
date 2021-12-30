import { User, UserAttributes } from '@database/entities/User'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
import { getRepository } from 'typeorm'
import userSchema from './schema'

interface DtoPaginate extends DtoFindAll {
  data: User[]
}

class UserService {
  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoPaginate> {
    const userRepository = getRepository(User)

    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10

    const data = await userRepository
      .createQueryBuilder('user')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .leftJoinAndSelect('user.role', 'role')
      .getMany()

    const total = await userRepository.createQueryBuilder().getCount()

    return { message: `${total} data has been received.`, data, total }
  }

  /**
   *
   * @param id
   * @returns
   */
  public static async findById(id: string): Promise<User> {
    const userRepository = getRepository(User)

    const newId = validateUUID(id)
    const data = await userRepository.findOne(newId, { relations: ['role'] })

    if (!data) {
      throw new ResponseError.NotFound(
        'user data not found or has been deleted'
      )
    }

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: UserAttributes): Promise<User> {
    const userRepository = getRepository(User)
    const data = new User()

    const value = useValidation(userSchema.create, formData)
    const newData = await userRepository.save({ ...data, ...value })

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
    formData: Partial<UserAttributes>
  ): Promise<User> {
    const userRepository = getRepository(User)
    const data = await this.findById(id)

    const value = useValidation(userSchema.create, {
      ...data,
      ...formData,
    })

    const newData = await userRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param id
   */
  public static async restore(id: string): Promise<void> {
    const userRepository = getRepository(User)

    const newId = validateUUID(id)
    await userRepository.restore(newId)
  }

  /**
   *
   * @param id
   */
  public static async softDelete(id: string): Promise<void> {
    const userRepository = getRepository(User)
    const data = await this.findById(id)

    await userRepository.softDelete(data.id)
  }

  /**
   *
   * @param id
   */
  public static async forceDelete(id: string): Promise<void> {
    const userRepository = getRepository(User)
    const data = await this.findById(id)

    await userRepository.delete(data.id)
  }
}

export default UserService
