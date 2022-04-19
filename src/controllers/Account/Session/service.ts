import { Session, SessionAttributes } from '@database/entities/Session'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import { DtoFindAll } from '@expresso/interfaces/Paginate'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { queryFiltered } from '@expresso/modules/TypeORMQuery'
import { Request } from 'express'
import { getRepository } from 'typeorm'
import sessionSchema from './schema'

interface DtoPaginate extends DtoFindAll {
  data: Session[]
}

class SessionService {
  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoPaginate> {
    const sessionRepository = getRepository(Session)

    const query = sessionRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Session.User', 'User')
    const newQuery = queryFiltered(query, req)

    const data = await newQuery.orderBy('Session.createdAt', 'DESC').getMany()
    const total = await newQuery.getCount()

    return { message: `${total} data has been received.`, data, total }
  }

  /**
   *
   * @param id
   * @returns
   */
  public static async findById(id: string): Promise<Session> {
    const sessionRepository = getRepository(Session)

    const newId = validateUUID(id)
    const data = await sessionRepository.findOne({ where: { id: newId } })

    if (!data) {
      throw new ResponseError.NotFound(
        'session data not found or has been deleted'
      )
    }

    return data
  }

  /**
   *
   * @param UserId
   * @param token
   * @returns
   */
  public static async findByUserToken(
    UserId: string,
    token: string
  ): Promise<Session> {
    const sessionRepository = getRepository(Session)

    const data = await sessionRepository.findOne({ where: { UserId, token } })

    if (!data) {
      throw new ResponseError.Unauthorized(
        'the login session has ended, please re-login'
      )
    }

    return data
  }

  /**
   *
   * @param formData
   * @returns
   */
  public static async create(formData: SessionAttributes): Promise<Session> {
    const sessionRepository = getRepository(Session)

    const value = useValidation(sessionSchema.create, formData)

    const data = new Session()
    const newData = await sessionRepository.save({ ...data, ...value })

    return newData
  }

  /**
   *
   * @param formData
   */
  public static async createOrUpdate(
    formData: SessionAttributes
  ): Promise<void> {
    const sessionRepository = getRepository(Session)
    const value = useValidation(sessionSchema.create, formData)

    const data = await sessionRepository.findOne({
      where: { UserId: value.UserId },
    })

    if (!data) {
      await this.create(formData)
    } else {
      await sessionRepository.save({ ...data, ...value })
    }
  }

  /**
   *
   * @param UserId
   * @param token
   */
  public static async deleteByUserToken(
    UserId: string,
    token: string
  ): Promise<void> {
    const sessionRepository = getRepository(Session)

    const query = sessionRepository
      .createQueryBuilder()
      .delete()
      .where('UserId = :UserId', { UserId })
      .where('token = :token', { token })

    await query.execute()
  }

  /**
   *
   * @param id
   */
  public static async delete(id: string): Promise<void> {
    const sessionRepository = getRepository(Session)
    const data = await this.findById(id)

    await sessionRepository.delete(data.id)
  }
}

export default SessionService
