import _ from 'lodash'
import { type MigrationInterface, type QueryRunner } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import ConstRole from '~/core/constant/entity/role'
import { User } from '~/database/entities/User'
import { AppDataSource } from '../datasource'

const defaultPass = 'Padang123'

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

export class UserSeeder1642508834295 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    const formData: any[] = []

    if (!_.isEmpty(data)) {
      for (let i = 0; i < data.length; i += 1) {
        const item = data[i]

        formData.push({
          ...item,
          id: uuidv4(),
          is_active: true,
          password: defaultPass,
          created_at: new Date(),
          updated_at: new Date(),
        })
      }
    }

    // save
    await AppDataSource.getRepository(User).save(formData)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM user`)
  }
}
