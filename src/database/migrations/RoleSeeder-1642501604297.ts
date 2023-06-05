import _ from 'lodash'
import { type MigrationInterface, type QueryRunner } from 'typeorm'
import ConstRole from '~/core/constants/ConstRole'
import { AppDataSource } from '~/database/data-source'
import { Role } from '~/database/entities/Role'

const data = [
  {
    id: ConstRole.ID_SUPER_ADMIN,
    name: 'Super Admin',
  },
  {
    id: ConstRole.ID_ADMIN,
    name: 'Admin',
  },
  {
    id: ConstRole.ID_USER,
    name: 'User',
  },
]

const formData: any[] = []

if (!_.isEmpty(data)) {
  for (let i = 0; i < data.length; i += 1) {
    const item = data[i]

    formData.push({
      ...item,
      created_at: new Date(),
      updated_at: new Date(),
    })
  }
}

export class RoleSeeder1642501604297 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {
    // save
    await AppDataSource.getRepository(Role).save(formData)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM role`)
  }
}
