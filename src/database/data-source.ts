import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from '~/config/env'

export const AppDataSource = new DataSource({
  type: env.TYPEORM_CONNECTION as 'mysql' | 'postgres',
  host: env.TYPEORM_HOST,
  port: env.TYPEORM_PORT,
  username: env.TYPEORM_USERNAME,
  password: env.TYPEORM_PASSWORD,
  database: env.TYPEORM_DATABASE,
  synchronize: env.TYPEORM_SYNCHRONIZE,
  logging: env.TYPEORM_LOGGING,
  migrationsRun: env.TYPEORM_MIGRATIONS_RUN,
  entities: [`${process.cwd()}/dist/database/entities/**/*{.js,.ts}`],
  migrations: [`${process.cwd()}/dist/database/migrations/**/*{.js,.ts}`],
  subscribers: [`${process.cwd()}/dist/database/subscribers/**/*{.js,.ts}`],
})
