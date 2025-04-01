import { AppDataSource } from '../database/connection'
import { Session } from '../database/entity/session'
import { sessionSchema } from '../database/schema/session'
import BaseService from './base'

export default class SessionService extends BaseService<Session> {
  constructor() {
    super({
      repository: AppDataSource.getRepository(Session),
      schema: sessionSchema,
      model: 'session',
    })
  }
}
