import { type MigrationInterface, type QueryRunner } from 'typeorm'
import { env } from '~/config/env'

export class PostgreSQLQuery1678149147506 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const dbName = env.TYPEORM_DATABASE
    const timezone = env.TYPEORM_TIMEZONE

    await queryRunner.query(`SELECT * FROM pg_timezone_names;`)
    await queryRunner.query(
      `ALTER DATABASE ${dbName} SET timezone TO '${timezone}';`
    )
  }

  public async down(_: QueryRunner): Promise<void> {
    // no query run
  }
}
