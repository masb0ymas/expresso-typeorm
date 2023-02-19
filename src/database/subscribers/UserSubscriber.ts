import { User } from '@database/entities/User'
import * as bcrypt from 'bcrypt'
import _ from 'lodash'
import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
  type UpdateEvent,
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
    if (!_.isEmpty(event.entity.password)) {
      return this.hashPassword(event.entity)
    }
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    // check entity from request
    if (!_.isEmpty(event.entity?.password)) {
      if (event.entity?.password !== event.databaseEntity?.password) {
        // @ts-expect-error: Unreachable code error
        await this.hashPassword(event?.entity)
      }
    }
  }
}
