import 'reflect-metadata'
import { DataSource } from 'typeorm'
import {
  TYPEORM_CONNECTION,
  TYPEORM_DATABASE,
  TYPEORM_HOST,
  TYPEORM_LOGGING,
  TYPEORM_MIGRATIONS_RUN,
  TYPEORM_PASSWORD,
  TYPEORM_PORT,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_USERNAME,
} from '../config/env'

export const AppDataSource = new DataSource({
  type: TYPEORM_CONNECTION as 'mysql' | 'postgres',
  host: TYPEORM_HOST,
  port: TYPEORM_PORT,
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  synchronize: TYPEORM_SYNCHRONIZE,
  logging: TYPEORM_LOGGING,
  migrationsRun: TYPEORM_MIGRATIONS_RUN,
  entities: [`${process.cwd()}/dist/database/entities/**/*{.js,.ts}`],
  migrations: [`${process.cwd()}/dist/database/migrations/**/*{.js,.ts}`],
  subscribers: [`${process.cwd()}/dist/database/subscribers/**/*{.js,.ts}`],
})
