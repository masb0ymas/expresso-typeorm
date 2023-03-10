import { Storage } from 'expresso-provider'
import {
  STORAGE_ACCESS_KEY,
  STORAGE_BUCKET_NAME,
  STORAGE_PROVIDER,
  STORAGE_REGION,
  STORAGE_SECRET_KEY,
  STORAGE_SIGN_EXPIRED,
} from './env'

const storageProvider = STORAGE_PROVIDER as 's3' | 'minio' | 'gcp'

export const storageService = new Storage({
  provider: storageProvider,
  accessKey: String(STORAGE_ACCESS_KEY),
  secretKey: STORAGE_SECRET_KEY,
  bucket: STORAGE_BUCKET_NAME,
  region: STORAGE_REGION,
  expires: STORAGE_SIGN_EXPIRED,
})
