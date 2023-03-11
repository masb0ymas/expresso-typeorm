import ResponseError from '@core/modules/response/ResponseError'
import { printLog } from 'expresso-core'
import * as nodeFs from 'fs'
import fs from 'fs/promises'
import path from 'path'

/**
 * Write File Stream
 * @param _path
 * @param streamFile
 */
export async function writeFileStream(
  _path: string,
  streamFile: Buffer
): Promise<void> {
  try {
    await fs.writeFile(_path, streamFile)

    const msgType = `File : ${_path}`
    const message = 'generate file successfully'
    const logMessage = printLog(msgType, message)

    console.log(logMessage)
  } catch (err) {
    const msgType = `File : ${_path}`
    const logMessage = printLog(msgType, String(err))

    console.log(logMessage)
    throw new ResponseError.BadRequest('failed to generate write file stream')
  }
}

/**
 * Delete File
 * @param _path
 */
export function deleteFile(_path: string): void {
  const filePath = path.resolve(_path)

  const msgType = `File : ${filePath}`

  if (_path && nodeFs.existsSync(filePath)) {
    const message = 'has been deleted'
    const logMessage = printLog(msgType, message)

    console.log(logMessage)

    nodeFs.unlinkSync(path.resolve(filePath))
  } else {
    const message = 'not exist'
    const logMessage = printLog(msgType, message)

    console.log(logMessage)
  }
}
