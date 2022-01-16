import { validateBoolean } from '@expresso/helpers/Formatter'
import { ConnectionOptions } from 'typeorm'
import {
  TYPEORM_CONNECTION,
  TYPEORM_DATABASE,
  TYPEORM_ENTITIES,
  TYPEORM_ENTITIES_DIR,
  TYPEORM_HOST,
  TYPEORM_LOGGING,
  TYPEORM_MIGRATIONS,
  TYPEORM_MIGRATIONS_DIR,
  TYPEORM_MIGRATIONS_RUN,
  TYPEORM_PASSWORD,
  TYPEORM_PORT,
  TYPEORM_SUBSCRIBERS,
  TYPEORM_SUBSCRIBERS_DIR,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_USERNAME,
} from './env'

const databaseConfig: ConnectionOptions = {
  type: TYPEORM_CONNECTION as 'mysql' | 'postgres' | 'mongodb',
  host: TYPEORM_HOST,
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  port: TYPEORM_PORT,
  synchronize: validateBoolean(TYPEORM_SYNCHRONIZE),
  logging: validateBoolean(TYPEORM_LOGGING),
  entities: [TYPEORM_ENTITIES],
  migrations: [TYPEORM_MIGRATIONS],
  migrationsRun: validateBoolean(TYPEORM_MIGRATIONS_RUN),
  subscribers: [TYPEORM_SUBSCRIBERS],
  cli: {
    entitiesDir: TYPEORM_ENTITIES_DIR,
    migrationsDir: TYPEORM_MIGRATIONS_DIR,
    subscribersDir: TYPEORM_SUBSCRIBERS_DIR,
  },
}

export default databaseConfig
