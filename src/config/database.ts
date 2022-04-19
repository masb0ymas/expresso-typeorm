import { validateBoolean } from '@expresso/helpers/Formatter'
import { DataSource } from 'typeorm'
import {
  TYPEORM_CONNECTION,
  TYPEORM_DATABASE,
  TYPEORM_ENTITIES,
  TYPEORM_HOST,
  TYPEORM_LOGGING,
  TYPEORM_MIGRATIONS,
  TYPEORM_MIGRATIONS_RUN,
  TYPEORM_PASSWORD,
  TYPEORM_PORT,
  TYPEORM_SUBSCRIBERS,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_USERNAME,
} from './env'

const DBConnection = new DataSource({
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
})

export default DBConnection
