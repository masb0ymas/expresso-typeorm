import fs from 'fs'

/**
 * Read HTML File
 * @param filePath
 * @param callback
 */
export function readHTMLFile(filePath: string, callback: any): void {
  fs.readFile(filePath, { encoding: 'utf-8' }, function (err, html) {
    if (err) {
      callback(err)
    } else {
      callback(null, html)
    }
  })
}
