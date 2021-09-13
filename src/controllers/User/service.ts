import { User, UserPost } from '@entity/User'
import useValidation from '@expresso/hooks/useValidation'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
import 'reflect-metadata'
import { getRepository } from 'typeorm'
import userSchema from './schema'

interface UserPaginate {
  data: User[]
  total: number
}

class UserService {
  public static async getAll(req: Request): Promise<UserPaginate> {
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

  public static async getOne(id: string): Promise<User> {
    const userRepository = getRepository(User)
    const data = await userRepository.findOne(id)

    if (!data) {
      throw new ResponseError.NotFound(
        'user data not found or has been deleted'
      )
    }

    return data
  }

  public static async created(formData: UserPost): Promise<User> {
    const userRepository = getRepository(User)
    const data = new User()

    const value = useValidation(userSchema.create, formData)
    const newData = await userRepository.save({ ...data, ...value })

    return newData
  }

  public static async updated(id: string, formData: UserPost): Promise<User> {
    const userRepository = getRepository(User)
    const data = await this.getOne(id)

    const value = useValidation(userSchema.create, {
      ...data,
      ...formData,
    })

    const newData = await userRepository.save({ ...data, ...value })

    return newData
  }

  public static async deleted(id: string): Promise<void> {
    const userRepository = getRepository(User)
    const data = await this.getOne(id)
    console.log({ data })

    await userRepository.delete(id)
  }
}

export default UserService
