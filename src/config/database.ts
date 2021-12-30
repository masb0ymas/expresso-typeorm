import { validateBoolean } from '@expresso/helpers/Formatter'
import { ConnectionOptions } from 'typeorm'
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
} from './env'

// const PRODUCTION_ENV = NODE_ENV === 'production'

const databaseConfig: ConnectionOptions = {
  type: TYPEORM_CONNECTION as 'mysql' | 'postgres' | 'mongodb',
  host: TYPEORM_HOST,
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  port: TYPEORM_PORT,
  synchronize: validateBoolean(TYPEORM_SYNCHRONIZE),
  logging: validateBoolean(TYPEORM_LOGGING),
  entities: ['dist/database/entities/**/*.js'],
  migrations: ['dist/database/migrations/**/*.js'],
  migrationsRun: validateBoolean(TYPEORM_MIGRATIONS_RUN),
  cli: {
    migrationsDir: 'dist/database/migrations',
    entitiesDir: 'dist/database/entities',
  },
}

export default databaseConfig
