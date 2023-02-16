import { defaultAllowedExt } from '@core/constants/allowedExtension'
import { defaultAllowedMimetype } from '@core/constants/allowedMimetype'
import { createDirNotExist } from '@core/helpers/files'
import { type MulterConfigEntity } from '@core/interface/Multer'
import ResponseError from '@core/modules/response/ResponseError'
import { type Request } from 'express'
import multer from 'multer'
import slugify from 'slugify'

const defaultFieldSize = 10 * 1024 * 1024 // 10mb
const defaultFileSize = 1 * 1024 * 1024 // 1mb
const defaultDestination = 'public/uploads/'

/**
 * Hooks useMulter
 * @param values
 * @returns
 */
function useMulter(values: MulterConfigEntity): multer.Multer {
  // always check destination
  const destination = values.dest ?? defaultDestination
  createDirNotExist(destination)

  // config storage
  const storage = multer.diskStorage({
    destination,
    filename(_req: Request, file: Express.Multer.File, cb): void {
      const slugFilename = slugify(file.originalname, {
        replacement: '_',
        lower: true,
      })
      cb(null, [Date.now(), slugFilename].join('-'))
    },
  })

  // config multer upload
  const configMulter = multer({
    storage,
    fileFilter(_req, file, cb) {
      const allowedMimetype = values.allowedMimetype ?? defaultAllowedMimetype
      const allowedExt = values.allowedExt ?? defaultAllowedExt
      const mimetype = file.mimetype.toLowerCase()

      console.log({ mimetype })

      if (!allowedMimetype.includes(mimetype)) {
        const getExtension = allowedExt.join(', ') // .png, .jpg, .pdf
        const message = `Only ${getExtension} ext are allowed, please check your mimetype file`

        cb(new ResponseError.BadRequest(message))
        return
      }

      cb(null, true)
    },
    limits: values.limit ?? {
      fieldSize: defaultFieldSize,
      fileSize: defaultFileSize,
    },
  })

  return configMulter
}

export default useMulter
