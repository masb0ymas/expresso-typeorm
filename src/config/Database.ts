import { validateBoolean } from '@expresso/helpers/Common'
import path from 'path'
import { ConnectionOptions } from 'typeorm'
import dotenv from 'dotenv'

dotenv.config()

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
    path.resolve(`${__dirname}/../entity/**/*.ts`),
    path.resolve(`${__dirname}/../entity/**/*.js`),
  ],
  migrations: [
    path.resolve(`${__dirname}/../migration/**/*.ts`),
    path.resolve(`${__dirname}/../migration/**/*.js`),
  ],
  subscribers: [
    path.resolve(`${__dirname}/../subscriber/**/*.ts`),
    path.resolve(`${__dirname}/../subscriber/**/*.js`),
  ],
  cli: {
    entitiesDir: path.resolve(`${__dirname}/../entity`),
    migrationsDir: path.resolve(`${__dirname}/../migration`),
    subscribersDir: path.resolve(`${__dirname}/../subscriber`),
  },
}

export default dbConfig
