import { Session, SessionPost } from '@entity/Session'
import { validateUUID } from '@expresso/helpers/Formatter'
import useValidation from '@expresso/hooks/useValidation'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
import 'reflect-metadata'
import { getRepository } from 'typeorm'
import sessionSchema from './schema'

interface DtoPaginate {
  message: string
  data: Session[]
  total: number
}

class SessionService {
  /**
   *
   * @param req
   * @returns
   */
  public static async findAll(req: Request): Promise<DtoPaginate> {
    const sessionRepository = getRepository(Session)

    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10

    const data = await sessionRepository
      .createQueryBuilder()
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany()

    const total = await sessionRepository.createQueryBuilder().getCount()

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
    const data = await sessionRepository.findOne(newId)

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
      throw new ResponseError.NotFound(
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
  public static async created(formData: SessionPost): Promise<Session> {
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
  public static async createOrUpdate(formData: SessionPost): Promise<void> {
    const sessionRepository = getRepository(Session)
    const value = useValidation(sessionSchema.create, formData)

    const data = await sessionRepository.findOne({
      where: { UserId: value.UserId },
    })

    if (!data) {
      await this.created(formData)
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

    await sessionRepository
      .createQueryBuilder()
      .delete()
      .where('UserId = :UserId', { UserId })
      .where('token = :token', { token })
      .execute()
  }

  /**
   *
   * @param id
   */
  public static async deleted(id: string): Promise<void> {
    const sessionRepository = getRepository(Session)
    const data = await this.findById(id)

    await sessionRepository.delete(data.id)
  }
}

export default SessionService
