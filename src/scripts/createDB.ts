import { createDatabase } from 'typeorm-extension'
import { AppDataSource } from '~/database/data-source'

async function createDB(): Promise<void> {
  // create database
  await createDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
    ifNotExist: true,
  })
}

void createDB()
