import _ from 'lodash'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { env } from '~/config/env'
import { ConstRole } from '~/lib/constant/seed/role'
import { AppDataSource } from '../connection'
import { User } from '../entity/user'

const data = [
  {
    fullname: 'Super Admin',
    email: 'super.admin@mail.com',
    role_id: ConstRole.ID_SUPER_ADMIN,
  },
  {
    fullname: 'Admin',
    email: 'admin@mail.com',
    role_id: ConstRole.ID_ADMIN,
  },
  {
    fullname: 'User',
    email: 'user@mail.com',
    role_id: ConstRole.ID_USER,
  },
]

export class UserSeeder1743412342642 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const formData: any[] = []

    if (!_.isEmpty(data)) {
      for (let i = 0; i < data.length; i += 1) {
        const item = data[i]

        formData.push({
          ...item,
          id: uuidv4(),
          is_active: true,
          password: env.APP_DEFAULT_PASS,
          created_at: new Date(),
          updated_at: new Date(),
        })
      }
    }

    // save
    await AppDataSource.getRepository(User).save(formData)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM user')
  }
}
