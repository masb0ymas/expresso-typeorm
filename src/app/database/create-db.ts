import { createDatabase } from 'typeorm-extension'
import { AppDataSource } from './connection'
import { logger } from '~/config/logger'

async function createDB() {
  logger.info('Creating database...', AppDataSource.options.database)

  // create database
  await createDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
    ifNotExist: true,
  })
}

createDB()
