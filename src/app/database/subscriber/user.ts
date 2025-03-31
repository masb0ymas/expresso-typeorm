import _ from 'lodash'
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm'
import Hashing from '~/config/hashing'
import { User } from '../schema/user'

const hashing = new Hashing()

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo(): typeof User {
    return User
  }

  async hashPassword(entity: User): Promise<void> {
    entity.password = await hashing.hash(entity.password)
  }

  beforeInsert(event: InsertEvent<User>): Promise<void> | undefined {
    if (!_.isEmpty(event.entity.password)) {
      return this.hashPassword(event.entity)
    }
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    // check entity from request
    if (!_.isEmpty(event.entity?.password)) {
      // check password entity
      if (event.entity?.password !== event.databaseEntity?.password) {
        // @ts-expect-error
        await this.hashPassword(event?.entity)
      }
    }
  }
}
