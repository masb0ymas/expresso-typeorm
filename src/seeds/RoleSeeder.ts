import { Role } from '@entity/Role'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'

export default class RoleSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values([{ name: 'Admin' }])
      .execute()
  }
}
