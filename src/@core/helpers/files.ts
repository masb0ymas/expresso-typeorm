import ResponseError from '@core/modules/response/ResponseError'
import * as nodeFs from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { logServer } from './formatter'

/**
 * Read HTML File
 * @param _path
 */
export async function readHTMLFile(_path: string): Promise<string> {
  try {
    const result = await fs.readFile(_path, { encoding: 'utf-8' })
    return result
  } catch (err) {
    throw new ResponseError.BadRequest('invalid html path')
  }
}

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

    console.log(logServer(`File : ${_path}`, 'generate file successfully'))
  } catch (err) {
    console.log(err)
    throw new ResponseError.BadRequest('failed to generate write file stream')
  }
}

/**
 * Create Dir If Not Exist
 * @param _path
 */
export async function createDirNotExist(_path: string): Promise<void> {
  if (!nodeFs.existsSync(path.resolve(_path))) {
    await fs.mkdir(_path, { recursive: true })
    console.log(logServer('Dir Path ', `created directory => ${_path}`))
  }
}

/**
 * Delete File
 * @param _path
 */
export function deleteFile(_path: string): void {
  const filePath = path.resolve(_path)

  if (_path && nodeFs.existsSync(filePath)) {
    console.log(logServer(`File : ${filePath}`, `has been deleted`))

    nodeFs.unlinkSync(path.resolve(filePath))
  } else {
    console.log(logServer(`File : ${filePath}`, `not exist`))
  }
}
