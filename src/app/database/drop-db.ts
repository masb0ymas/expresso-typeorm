import { dropDatabase } from 'typeorm-extension'
import { logger } from '~/config/logger'
import { AppDataSource } from './connection'

async function dropDB() {
  logger.info('Dropping database...', AppDataSource.options.database)

  // drop database
  await dropDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
    ifExist: true,
  })
}

dropDB()
