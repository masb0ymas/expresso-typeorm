import { AppDataSource } from '@database/data-source'
import { dropDatabase } from 'typeorm-extension'

void (async () => {
  // Create the database with specification of the DataSource options
  await dropDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
    ifExist: true,
  })
})()
