import { User, UserAttributes } from '@database/entities/User'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
import _ from 'lodash'
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
    const reqQuery = req.getQuery()

    // query pagination
    const page = Number(_.get(reqQuery, 'page', 1))
    const pageSize = Number(_.get(reqQuery, 'pageSize', 10))

    // query where
    const email = _.get(reqQuery, 'email', null)
    const RoleId = _.get(reqQuery, 'RoleId', null)

    const query = userRepository
      .createQueryBuilder()
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .leftJoinAndSelect('User.Role', 'Role')
      .leftJoinAndSelect('User.Sessions', 'Session')

    if (!_.isEmpty(email)) {
      query.where('User.email ILIKE :email', { email: `%${email}%` })
    }

    if (!_.isEmpty(RoleId)) {
      query.where('User.RoleId = :RoleId', { RoleId: `%${RoleId}%` })
    }

    const data = await query.orderBy('User.createdAt', 'DESC').getMany()
    const total = await query.getCount()

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
    const data = await userRepository.findOne(newId, {
      relations: ['Role', 'Sessions'],
    })

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

  /**
   * Multiple Force Delete
   * @param ids
   */
  public static async multipleRestore(ids: string[]): Promise<void> {
    const userRepository = getRepository(User)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('User.id IN (:...ids)', { ids: [...ids] })
      .restore()
      .execute()
  }

  /**
   * Multiple Soft Delete
   * @param ids
   */
  public static async multipleSoftDelete(ids: string[]): Promise<void> {
    const userRepository = getRepository(User)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('User.id IN (:...ids)', { ids: [...ids] })
      .softDelete()
      .execute()
  }

  /**
   * Multiple Force Delete
   * @param ids
   */
  public static async multipleForceDelete(ids: string[]): Promise<void> {
    const userRepository = getRepository(User)

    if (_.isEmpty(ids)) {
      throw new ResponseError.BadRequest('ids cannot be empty')
    }

    await userRepository
      .createQueryBuilder()
      .where('User.id IN (:...ids)', { ids: [...ids] })
      .delete()
      .execute()
  }
}

export default UserService
