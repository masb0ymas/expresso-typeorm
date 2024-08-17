import { createDirNotExist, logger, randomString } from 'expresso-core'
import fs from 'fs'
import path from 'path'
import { checkEnv } from '~/config/env'

const msgType = 'script'

/**
 *
 * @param {string} value
 * @param {RegExp} regExp
 */
function _generateEnv(value: string, regExp: RegExp): void {
  const envPath = path.resolve('.env')
  checkEnv(envPath)

  const contentEnv = fs.readFileSync(envPath, { encoding: 'utf-8' })

  const uniqueCode = randomString.generate()
  const valueEnv = `${value}=${uniqueCode}`

  if (contentEnv.includes(`${value}=`)) {
    // change value
    const replaceContent = contentEnv.replace(regExp, valueEnv)
    fs.writeFileSync(`${envPath}`, replaceContent)

    logger.info(`${msgType} - refresh ${value} = ${uniqueCode}`)
  } else {
    // Generate value
    const extraContent = `${valueEnv}\n\n${contentEnv}`
    fs.writeFileSync(`${envPath}`, extraContent)

    logger.info(`${msgType} - generate ${value} = ${uniqueCode}`)
  }
}

const listDirectories = [
  'public/uploads/temp',
  'public/uploads/excel',
  'temp/logs',
]

for (let i = 0; i < listDirectories.length; i += 1) {
  const dir = listDirectories[i]
  createDirNotExist(dir)
}

const listKeys = [
  'APP_KEY',
  'SECRET_OTP',
  'JWT_SECRET_ACCESS_TOKEN',
  'JWT_SECRET_REFRESH_TOKEN',
]

for (let i = 0; i < listKeys.length; i += 1) {
  const item = listKeys[i]
  const regex = new RegExp(`/${item}=(.*)?/`)
  _generateEnv(item, regex)
}
