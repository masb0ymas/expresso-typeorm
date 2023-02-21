import { AppDataSource } from '@database/data-source'
import { createDatabase } from 'typeorm-extension'

void (async () => {
  // Create the database with specification of the DataSource options
  await createDatabase({
    options: AppDataSource.options,
    initialDatabase: 'postgres',
  })
})()
