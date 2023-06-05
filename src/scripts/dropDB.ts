import { dropDatabase } from 'typeorm-extension'
import { AppDataSource } from '~/database/data-source'

async function dropDB(): Promise<void> {
  // drop database
  await dropDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
    ifExist: true,
  })
}

void dropDB()
