import { green } from 'colorette'
import { NextFunction, Request, Response } from 'express'
import { logger } from 'expresso-core'
import { TOptions } from 'i18next'
import { env } from '~/config/env'
import { i18n } from '~/config/i18n'
import { AppDataSource } from '~/database/datasource'
import { User, UserLoginAttributes } from '~/database/entities/User'

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

    const userRepo = AppDataSource.getRepository(User)

    const userLogin = req.getState('userLogin') as UserLoginAttributes
    const user_id = userLogin.uid

    const getUser = await userRepo.findOne({
      where: { id: user_id },
    })

    const errType = `permitted access error:`
    const errMessage = 'you are not allowed'

    if (getUser && !roles.includes(getUser.role_id)) {
      const msgType = green('permission')
      logger.error(`${msgType} - ${errType} ${errMessage}`)

      const message = i18n.t('errors.permission_access', i18nOpt)
      const result = {
        statusCode: 403,
        error: 'Forbidden',
        message: `${errType} ${message}`,
      }

      return res.status(403).json(result)
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

    const userRepo = AppDataSource.getRepository(User)

    const userLogin = req.getState('userLogin') as UserLoginAttributes
    const user_id = userLogin.uid

    const getUser = await userRepo.findOne({
      where: { id: user_id },
    })

    const errType = `not permitted access error:`
    const errMessage = 'you are not allowed'

    if (getUser && roles.includes(getUser.role_id)) {
      const msgType = green('permission')
      logger.error(`${msgType} - ${errType} ${errMessage}`)

      const message = i18n.t('errors.permission_access', i18nOpt)
      const result = {
        statusCode: 403,
        error: 'Forbidden',
        message: `${errType} ${message}`,
      }

      return res.status(403).json(result)
    }

    next()
  }
}
