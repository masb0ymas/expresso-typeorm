import 'reflect-metadata'

import { DataSource } from 'typeorm'
import { env } from '~/config/env'
import { logger } from '~/config/logger'

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
  entities: [`${process.cwd()}/dist/app/database/schema/**/*{.js,.ts}`],
  migrations: [`${process.cwd()}/dist/app/database/migration/**/*{.js,.ts}`],
  subscribers: [`${process.cwd()}/dist/app/database/subscriber/**/*{.js,.ts}`],
})

export const initDatabase = async () => {
  try {
    const connection = await AppDataSource.initialize()
    logger.info('Database connection established:', connection.options.database)
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    process.exit(1)
  }
}
