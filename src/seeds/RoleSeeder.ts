import { Role } from '@entity/Role'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'
import { v4 as uuidV4 } from 'uuid'

export default class RoleSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values([
        { id: uuidV4(), name: 'Admin' },
        { id: uuidV4(), name: 'User' },
      ])
      .execute()
  }
}
