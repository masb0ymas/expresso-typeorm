import { type FileAttributes } from 'expresso-provider/lib/interface'
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
