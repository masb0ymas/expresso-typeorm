import { describe, expect, test } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import {
  createDirNotExist,
  deleteFile,
  readHTMLFile,
  writeFileStream,
} from '../files'

describe('helpers file test', () => {
  test('should read html file', async () => {
    const _path = path.resolve(
      `${process.cwd()}/public/templates/emails/register.html`
    )

    const html = await readHTMLFile(_path)

    expect(html).toMatch(/html/)
  })

  test('should write file stream', async () => {
    const outputPath = path.resolve(`${process.cwd()}/public/output`)
    const anyContent = 'Any Content For Testing'

    await createDirNotExist(outputPath)
    await writeFileStream(`${outputPath}/test.txt`, Buffer.from(anyContent))

    // Result Value from Write file
    const content = await readHTMLFile(`${outputPath}/test.txt`)
    expect(content).toMatch(/Content/)
  })

  test('should delete file', () => {
    const outputPath = path.resolve(`${process.cwd()}/public/output/test.txt`)

    deleteFile(outputPath)
    const exists = fs.existsSync(outputPath)

    expect(exists).toBe(false)
  })
})
