import { TYPEORM_DATABASE } from '@config/env'
import { type MigrationInterface, type QueryRunner } from 'typeorm'

export class PostgreSQLQuery1678149147506 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const dbName = TYPEORM_DATABASE

    await queryRunner.query(`SELECT * FROM pg_timezone_names;`)
    await queryRunner.query(
      `ALTER DATABASE ${dbName} SET timezone TO 'Asia/Jakarta';`
    )
  }

  public async down(_: QueryRunner): Promise<void> {
    // no query run
  }
}
