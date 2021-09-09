export default {
  type: process.env.TYPEORM_CONNECTION ?? 'mysql',
  host: process.env.TYPEORM_HOST ?? '127.0.0.1',
  port: process.env.TYPEORM_PORT ?? 3306,
  username: process.env.TYPEORM_USERNAME ?? 'test',
  password: process.env.TYPEORM_PASSWORD ?? 'test',
  database: process.env.TYPEORM_DATABASE ?? 'example',
  timezone: process.env.TYPEORM_TIMEZONE ?? '+07:00',
  synchronize: process.env.TYPEORM_SYNCHRONIZE ?? true,
  logging: process.env.TYPEORM_LOGGING ?? false,
  entities: ['src/entity/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
}
