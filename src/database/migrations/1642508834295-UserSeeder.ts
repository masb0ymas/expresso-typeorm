import { User } from '@database/entities/User'
import ConstRole from '@expresso/constants/ConstRole'
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

const defaultPass = 'Padang123'

export class UserSeeder1642508834295 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {
    // save
    await getRepository(User).save([
      {
        id: uuidv4(),
        fullName: 'Super Admin',
        email: 'super.admin@mail.com',
        password: defaultPass,
        isActive: true,
        RoleId: ConstRole.ID_SUPER_ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        fullName: 'Admin',
        email: 'admin@mail.com',
        password: defaultPass,
        isActive: true,
        RoleId: ConstRole.ID_ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        fullName: 'User',
        email: 'user@mail.com',
        password: defaultPass,
        isActive: true,
        RoleId: ConstRole.ID_USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM User`)
  }
}
