import { User, UserPost } from '@entity/User'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
import { getRepository } from 'typeorm'
import userSchema from './schema'

interface DtoPaginate {
  data: User[]
  total: number
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

    return { data, total }
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
  public static async created(formData: UserPost): Promise<User> {
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
  public static async updated(id: string, formData: UserPost): Promise<User> {
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
  public static async deleted(id: string): Promise<void> {
    const userRepository = getRepository(User)
    const data = await this.findById(id)

    await userRepository.delete(data.id)
  }
}

export default UserService
