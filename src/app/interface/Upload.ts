import { FileAttributes } from 'expresso-provider/lib/storage/types'
import { Upload } from '~/database/entities/Upload'

export interface UploadFileEntity {
  fieldUpload: FileAttributes
  directory: string
  upload_id?: string | undefined
}

export interface DtoUploadFile {
  storage: any
  upload: Upload
}
