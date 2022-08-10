import { dropDatabase } from 'typeorm-extension'
import { AppDataSource } from '../data-source'

void (async () => {
  // Create the database with specification of the DataSource options
  await dropDatabase({ options: AppDataSource.options, ifExist: true })
})()
