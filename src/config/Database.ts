import { validateBoolean } from '@expresso/helpers/Common'
import path from 'path'
import { ConnectionOptions } from 'typeorm'
import dotenv from 'dotenv'

dotenv.config()

function pathResolve(_path: string): string {
  return path.resolve(`${__dirname}/../${_path}`)
}

const dbConfig: ConnectionOptions = {
  // @ts-expect-error
  type: process.env.TYPEORM_CONNECTION ?? 'mysql',
  host: process.env.TYPEORM_HOST ?? '127.0.0.1',
  port: Number(process.env.TYPEORM_PORT) ?? 3306,
  username: process.env.TYPEORM_USERNAME ?? 'test',
  password: process.env.TYPEORM_PASSWORD ?? 'test',
  database: process.env.TYPEORM_DATABASE ?? 'example',
  timezone: process.env.TYPEORM_TIMEZONE ?? '+07:00',
  synchronize: validateBoolean(process.env.TYPEORM_SYNCHRONIZE) ?? true,
  logging: validateBoolean(process.env.TYPEORM_LOGGING) ?? false,
  entities: [
    process.env.TYPEORM_ENTITIES ?? pathResolve(`entity/**/*{.ts,.js}`),
  ],
  migrations: [pathResolve(`migration/**/*{.ts,.js}`)],
  subscribers: [pathResolve(`subscriber/**/*{.ts,.js}`)],
  cli: {
    entitiesDir: pathResolve('entity'),
    migrationsDir: pathResolve('migration'),
    subscribersDir: pathResolve('subscriber'),
  },
}

export default dbConfig
