import Storage from '~/lib/storage'
import { GoogleCloudStorageParams } from '~/lib/storage/types'
import { env } from './env'

export const storage = Storage.create({
  storageType: 'gcs',
  params: {
    access_key: env.STORAGE_ACCESS_KEY,
    bucket: env.STORAGE_BUCKET_NAME,
    expires: env.STORAGE_SIGN_EXPIRED,
    filepath: env.STORAGE_FILEPATH,
  } as GoogleCloudStorageParams,
})
