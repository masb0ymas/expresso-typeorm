import { User } from '@database/entity/User'
import bcrypt from 'bcrypt'
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm'

const saltRound = 10

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<any> {
  listenTo(): typeof User {
    return User
  }

  async hashPassword(entity: User): Promise<void> {
    entity.password = await bcrypt.hash(entity.password, saltRound)
  }

  beforeInsert(event: InsertEvent<User>): Promise<void> | undefined {
    if (event.entity.password) {
      return this.hashPassword(event.entity)
    }
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    if (event.entity?.password !== event.databaseEntity?.password) {
      // @ts-expect-error
      await this.hashPassword(entity)
    }
  }
}
