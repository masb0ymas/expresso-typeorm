import { green } from 'colorette'
import { NextFunction, Request, Response } from 'express'
import { logger } from 'expresso-core'
import { useToken } from 'expresso-hooks'
import _ from 'lodash'
import { env } from '~/config/env'
import { Session } from '~/database/entities/Session'
import SessionService from '../service/session.service'

const newSessionService = new SessionService({
  tableName: 'session',
  entity: Session,
})

/**
 * Authorization
 * @param req
 * @param res
 * @param next
 * @returns
 */
export default async function authorization(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>> | undefined> {
  const getToken = useToken.extract(req)

  // verify token
  const token = useToken.verify({
    token: String(getToken),
    secretKey: env.JWT_SECRET_ACCESS_TOKEN,
  })

  // check session from token header
  const getSession = await newSessionService.getByToken(String(getToken))

  if (_.isEmpty(token?.data) || !getSession) {
    const msgType = green('permission')
    logger.error(`${msgType} - unauthorized invalid jwt`)

    const result = {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Unauthorized, invalid jwt',
    }

    return res.status(401).json(result)
  }

  req.setState({ userLogin: token?.data })
  next()
}
