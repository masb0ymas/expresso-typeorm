import { MailProvider } from 'expresso-core'
import {
  APP_NAME,
  MAIL_DRIVER,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_USERNAME,
} from './env'

const mailDriver = MAIL_DRIVER as 'smtp' | 'gmail'

const mailConfig = new MailProvider({
  appName: APP_NAME,
  driver: mailDriver,
  host: MAIL_HOST,
  port: MAIL_PORT,
  username: String(MAIL_USERNAME),
  password: MAIL_PASSWORD,
})

export function mailService(): MailProvider {
  return mailConfig
}
