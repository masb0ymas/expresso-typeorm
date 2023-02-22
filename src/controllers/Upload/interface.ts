import { type FileAttributes } from '@core/interface/File'

export interface UploadFileEntity {
  fieldUpload: FileAttributes
  directory: string
  UploadId?: string | null
}
