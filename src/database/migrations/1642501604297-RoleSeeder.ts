import { Role } from '@database/entities/Role'
import ConstRole from '@expresso/constants/ConstRole'
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm'

export class RoleSeeder1642501604297 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {
    // save
    await getRepository(Role).save([
      {
        id: ConstRole.ID_SUPER_ADMIN,
        name: 'Super Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ConstRole.ID_ADMIN,
        name: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: ConstRole.ID_USER,
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM Role`)
  }
}
