import 'reflect-metadata'
import {
  TYPEORM_CONNECTION,
  TYPEORM_HOST,
  TYPEORM_LOGGING,
  TYPEORM_MIGRATIONS_RUN,
  TYPEORM_PASSWORD,
  TYPEORM_PORT,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_USERNAME,
} from '@config/env'

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { createDatabase, dropDatabase } from 'typeorm-extension'
import App from '../../../app'

const Server = new App()

const AppDataSource = new DataSource({
  type: TYPEORM_CONNECTION as 'mysql' | 'postgres',
  host: TYPEORM_HOST,
  port: TYPEORM_PORT,
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: 'dev_expresso_typeorm_test',
  synchronize: TYPEORM_SYNCHRONIZE,
  logging: TYPEORM_LOGGING,
  migrationsRun: TYPEORM_MIGRATIONS_RUN,
  entities: [
    `${process.cwd()}/src/database/entities/**/*{.ts,.js}`,
    `${process.cwd()}/dist/database/entities/**/*{.ts,.js}`,
  ],
  migrations: [],
  subscribers: [
    `${process.cwd()}/src/database/subscribers/**/*{.ts,.js}`,
    `${process.cwd()}/dist/database/subscribers/**/*{.ts,.js}`,
  ],
})

async function dropDB(): Promise<void> {
  return await dropDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
    ifExist: true,
  })
}

async function createDB(): Promise<void> {
  return await createDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
  })
}

describe('POST /v1/auth/sign-up', () => {
  const app = Server.app()

  beforeAll(async () => {
    await dropDB()

    await createDB()

    await AppDataSource.initialize()
  })

  afterAll(async () => {
    await AppDataSource.destroy()
  })

  test('should register account', async () => {
    const formData = {
      fullname: 'any_name',
      email: 'any@mail.com',
      new_password: 'any_password',
      confirm_new_password: 'any_password',
      phone: '-',
      is_active: false,
    }

    const res = await request(app).post('/v1/auth/sign-up').send(formData)

    console.log({ res })

    expect(res.statusCode).toBe(200)
  })
})
