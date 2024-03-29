import { green } from 'colorette'
import { type NextFunction, type Request, type Response } from 'express'
import { logger } from 'expresso-core'
import { type TOptions } from 'i18next'
import { env } from '~/config/env'
import { i18n } from '~/config/i18n'
import { AppDataSource } from '~/database/data-source'
import { User, type UserLoginAttributes } from '~/database/entities/User'

/**
 * Permission Access
 * @param roles
 * @returns
 */
export function permissionAccess(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { lang } = req.getQuery()
    const defaultLang = lang ?? env.APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const userRepository = AppDataSource.getRepository(User)

    const userLogin = req.getState('userLogin') as UserLoginAttributes
    const getUser = await userRepository.findOne({
      where: { id: userLogin.uid },
    })

    const errType = `permitted access error:`
    const errMessage = 'you are not allowed'

    if (getUser && !roles.includes(getUser.role_id)) {
      const msgType = green('permission')
      logger.error(`${msgType} - ${errType} ${errMessage}`)

      const message = i18n.t('errors.permission_access', i18nOpt)

      return res.status(403).json({
        statusCode: 403,
        message: `${errType} ${message}`,
      })
    }

    next()
  }
}

/**
 * Not Permitted Access
 * @param roles
 * @returns
 */
export function notPermittedAccess(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { lang } = req.getQuery()
    const defaultLang = lang ?? env.APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const userRepository = AppDataSource.getRepository(User)

    const userLogin = req.getState('userLogin') as UserLoginAttributes
    const getUser = await userRepository.findOne({
      where: { id: userLogin.uid },
    })

    const errType = `not permitted access error:`
    const errMessage = 'you are not allowed'

    if (getUser && roles.includes(getUser.role_id)) {
      const msgType = green('permission')
      logger.error(`${msgType} - ${errType} ${errMessage}`)

      const message = i18n.t('errors.permission_access', i18nOpt)

      return res.status(403).json({
        statusCode: 403,
        message: `${errType} ${message}`,
      })
    }

    next()
  }
}
