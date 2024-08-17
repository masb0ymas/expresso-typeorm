import { green } from 'colorette'
import { logger, readHTMLFile } from 'expresso-core'
import fs from 'fs'
import Handlebars from 'handlebars'
import path from 'path'
import { env } from '~/config/env'
import { mailService } from '~/config/mail'
import { TMailRegistrationEntity } from '../interface/Mailing'
import ErrorResponse from '../modules/response/ErrorResponse'

export default class Mailing {
  /**
   *
   * @param htmlPath
   * @returns
   */
  private _getPath(htmlPath: string): string {
    const templatePath = path.resolve(
      `${process.cwd()}/public/templates/emails/${htmlPath}`
    )

    const msgType = green('email template')
    logger.info(`${msgType} - ${templatePath} exists`)

    return templatePath
  }

  /**
   * Send Template Mail
   * @param _path
   * @param mailTo
   * @param subject
   * @param data
   */
  private async _sendTemplateMail(
    _path: string,
    mailTo: string,
    subject: string,
    data: string | any
  ): Promise<void> {
    if (!fs.existsSync(_path)) {
      throw new ErrorResponse.BadRequest('invalid template path ')
    }

    const html = await readHTMLFile(_path)

    const template = Handlebars.compile(html)
    const htmlToSend = template(data)

    mailService.send(mailTo, subject, htmlToSend)
  }

  /**
   *
   * @param values
   */
  public async accountRegistration(
    values: TMailRegistrationEntity
  ): Promise<void> {
    const _path = this._getPath('register.html')

    const { fullname, email } = values
    const subject = `${fullname}, Thank you for registering on the ${env.APP_NAME} App`

    const data = { ...values }
    await this._sendTemplateMail(_path, email, subject, data)
  }
}
