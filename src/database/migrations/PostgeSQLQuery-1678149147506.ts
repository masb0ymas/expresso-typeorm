import { type MigrationInterface, type QueryRunner } from 'typeorm'
import { env } from '~/config/env'

const db_name = env.TYPEORM_DATABASE
const timezone = env.TYPEORM_TIMEZONE

export class PostgreSQLQuery1678149147506 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT * FROM pg_timezone_names;`)
    await queryRunner.query(
      `ALTER DATABASE ${db_name} SET timezone TO '${timezone}';`
    )
  }

  public async down(_: QueryRunner): Promise<void> {
    // no query run
  }
}
