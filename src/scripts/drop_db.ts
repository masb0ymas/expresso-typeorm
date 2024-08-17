import { dropDatabase } from 'typeorm-extension'
import { AppDataSource } from '~/database/datasource'

async function dropDB() {
  // drop database
  await dropDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
    ifExist: true,
  })
}

dropDB()
