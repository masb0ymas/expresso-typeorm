import { User } from '@database/entities/User'
import ConstRole from '@expresso/constants/ConstRole'
import _ from 'lodash'
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

const defaultPass = 'Padang123'

const data = [
  {
    fullName: 'Super Admin',
    email: 'super.admin@mail.com',
    RoleId: ConstRole.ID_SUPER_ADMIN,
  },
  {
    fullName: 'Admin',
    email: 'admin@mail.com',
    RoleId: ConstRole.ID_ADMIN,
  },
  {
    fullName: 'User',
    email: 'user@mail.com',
    RoleId: ConstRole.ID_USER,
  },
]

const formData: any[] = []

if (!_.isEmpty(data)) {
  for (let i = 0; i < data.length; i += 1) {
    const item = data[i]

    formData.push({
      ...item,
      id: uuidv4(),
      isActive: true,
      password: defaultPass,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}

export class UserSeeder1642508834295 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {
    // save
    await getRepository(User).save(formData)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM User`)
  }
}
