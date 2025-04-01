import { AppDataSource } from '../database/connection'
import { Upload } from '../database/entity/upload'
import { uploadSchema } from '../database/schema/upload'
import BaseService from './base'

export default class UploadService extends BaseService<Upload> {
  constructor() {
    super({
      repository: AppDataSource.getRepository(Upload),
      schema: uploadSchema,
      model: 'upload',
    })
  }
}
