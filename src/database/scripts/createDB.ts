import { createDatabase } from 'typeorm-extension'
import { AppDataSource } from '../data-source'

void (async () => {
  // Create the database with specification of the DataSource options
  await createDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
  })
})()
