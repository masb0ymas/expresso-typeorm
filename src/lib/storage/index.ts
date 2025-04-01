import GoogleCloudStorage from './gcs'
import MinIOStorage from './minio'
import S3Storage from './s3'
import { GoogleCloudStorageParams, MinIOStorageParams, S3StorageParams } from './types'

export type StorageType = 's3' | 'minio' | 'gcs'

export type StorageParams = {
  storageType: StorageType
  params: S3StorageParams | MinIOStorageParams | GoogleCloudStorageParams
}

export default class Storage {
  constructor({ storageType, params }: StorageParams) {
    switch (storageType) {
      case 's3':
        // @ts-expect-error
        return new S3Storage(params)

      case 'minio':
        // @ts-expect-error
        return new MinIOStorage(params)

      case 'gcs':
        // @ts-expect-error
        return new GoogleCloudStorage(params)

      default:
        throw new Error('Invalid storage type')
    }
  }
}
