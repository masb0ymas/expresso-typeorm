import { createDirNotExist, logger, randomString } from 'expresso-core'
import fs from 'fs'
import path from 'path'
import { checkEnv } from '~/config/env'

const msgType = 'script'

/**
 *
 * @param {string} key
 * @param {RegExp} regExp
 */
function _generateEnv(key: string, regExp: RegExp) {
  const envPath = path.resolve('.env')
  checkEnv()

  const contentEnv = fs.readFileSync(envPath, { encoding: 'utf-8' })
  const uniqueCode = randomString.generate()
  const newEnvEntry = `${key}=${uniqueCode}`

  if (contentEnv.includes(`${key}=`)) {
    // change value
    const replaceContent = contentEnv.replace(regExp, newEnvEntry)

    fs.writeFileSync(`${envPath}`, replaceContent)
    logger.info(`${msgType} - refresh ${key} = ${uniqueCode}`)
  } else {
    // Generate value
    const extraContent = `${newEnvEntry}\n\n${contentEnv}`

    fs.writeFileSync(`${envPath}`, extraContent)
    logger.info(`${msgType} - generate ${key} = ${uniqueCode}`)
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

listKeys.forEach((item) => {
  const newItem = `/${item}=(.*)?/`.replace(/\//g, '')
  const regex = new RegExp(newItem)

  console.log({ regex })
  _generateEnv(item, regex)
})
