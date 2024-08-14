import { createDatabase } from 'typeorm-extension'
import { AppDataSource } from '~/database/datasource'

async function createDB() {
  // create database
  await createDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
    ifNotExist: true,
  })
}

createDB()
