import 'reflect-metadata'

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
} from '@config/env'
import { Role } from '@database/entities/Role'
import { Session } from '@database/entities/Session'
import { Upload } from '@database/entities/Upload'
import { User } from '@database/entities/User'
import { afterAll, beforeEach, describe, expect, test } from '@jest/globals'
import request from 'supertest'
import { DataSource } from 'typeorm'
import App from '../../../app'

const server = new App()
const app = server.app()

const AppDataSource = new DataSource({
  type: TYPEORM_CONNECTION as 'mysql' | 'postgres',
  host: TYPEORM_HOST,
  port: TYPEORM_PORT,
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  synchronize: TYPEORM_SYNCHRONIZE,
  logging: TYPEORM_LOGGING,
  migrationsRun: TYPEORM_MIGRATIONS_RUN,
  entities: [Role, Upload, Session, User],
  migrations: [`${process.cwd()}/dist/database/migrations/**/*{.js,.ts}`],
  subscribers: [`${process.cwd()}/dist/database/subscribers/**/*{.js,.ts}`],
})

describe('endpoint : Auth Controller Test', () => {
  let connections: DataSource

  beforeEach(async () => {
    connections = await AppDataSource.initialize()
  })

  afterAll(async () => {
    await connections.destroy()

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        resolve()
      }, 500)
    ) // avoid jest open handle error
  })

  // TO-DO: problem fixed error typeorm No Metadata "Entity" was found
  test('should be test endpoint /v1/auth/sign-up', async () => {
    const formData = {
      fullname: 'anyName',
      email: 'any@mail.com',
      newPassword: 'anyPassword',
      confirmNewPassword: 'anyPassword',
    }

    const response = await request(app)
      .post('/v1/auth/sign-up')
      .set('Accept', 'application/json')
      .send(formData)

    console.log(response)

    expect(response.status).toEqual(200)
  })
})
