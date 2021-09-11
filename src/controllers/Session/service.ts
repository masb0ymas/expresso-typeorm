import { Session, SessionPost } from '@entity/Session'
import useValidation from '@expresso/hooks/useValidation'
import ResponseError from '@expresso/modules/Response/ResponseError'
import { Request } from 'express'
import 'reflect-metadata'
import { getRepository } from 'typeorm'
import sessionSchema from './schema'

interface SessionPaginate {
  data: Session[]
  total: number
}

class SessionService {
  public static async getAll(req: Request): Promise<SessionPaginate> {
    const sessionRepository = getRepository(Session)

    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10

    const data = await sessionRepository
      .createQueryBuilder()
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany()

    const total = await sessionRepository.createQueryBuilder().getCount()

    return { data, total }
  }

  public static async getOne(id: string): Promise<Session> {
    const sessionRepository = getRepository(Session)
    const data = await sessionRepository.findOne(id)

    if (!data) {
      throw new ResponseError.NotFound(
        'role data not found or has been deleted'
      )
    }

    return data
  }

  public static async created(formData: SessionPost): Promise<Session> {
    const sessionRepository = getRepository(Session)

    const value = useValidation(sessionSchema.create, formData)

    const data = new Session()
    const newData = await sessionRepository.save({ ...data, ...value })

    return newData
  }

  public static async updated(
    id: string,
    formData: SessionPost
  ): Promise<Session> {
    const sessionRepository = getRepository(Session)
    const data = await this.getOne(id)

    const value = useValidation(sessionSchema.create, {
      ...data,
      ...formData,
    })

    const newData = await sessionRepository.save({ ...data, ...value })

    return newData
  }

  public static async deleted(id: string): Promise<void> {
    const sessionRepository = getRepository(Session)

    const data = await this.getOne(id)
    console.log({ data })

    await sessionRepository.delete(id)
  }
}

export default SessionService
