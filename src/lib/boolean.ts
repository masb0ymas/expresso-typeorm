import { env } from '~/config/env'

/**
 * Check if storage is enabled
 */
export function storageExists(): boolean {
  switch (env.STORAGE_PROVIDER) {
    case 'minio':
      return Boolean(
        env.STORAGE_HOST &&
          env.STORAGE_BUCKET_NAME &&
          env.STORAGE_ACCESS_KEY &&
          env.STORAGE_SECRET_KEY
      )

    case 's3':
      return Boolean(env.STORAGE_BUCKET_NAME && env.STORAGE_ACCESS_KEY && env.STORAGE_SECRET_KEY)

    case 'gcs':
      return Boolean(env.STORAGE_ACCESS_KEY && env.STORAGE_BUCKET_NAME && env.STORAGE_FILEPATH)

    default:
      return false
  }
}

/**
 * Check if mail is enabled
 */
export function mailExists(): boolean {
  return Boolean(
    env.MAIL_HOST && env.MAIL_PORT && env.MAIL_USERNAME && env.MAIL_PASSWORD && env.MAIL_FROM
  )
}
