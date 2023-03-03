import { JWT_ACCESS_TOKEN_EXPIRED, JWT_SECRET_ACCESS_TOKEN } from '@config/env'
import {
  type DtoGenerateToken,
  type DtoVerifyToken,
} from '@core/interface/Token'
import { type Request } from 'express'
import { type IncomingHttpHeaders } from 'http'
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from 'jsonwebtoken'
import ms from 'ms'
import { logErrServer, logServer } from './formatter'

/**
 *
 * @param value
 * @returns
 */
export function generateToken(
  value: string | object | any,
  secretKey?: string
): DtoGenerateToken {
  const tokenExpires = ms(JWT_ACCESS_TOKEN_EXPIRED)
  const expiresIn = Number(tokenExpires) / 1000

  const payload = JSON.parse(JSON.stringify(value))
  const newSecretKey = secretKey ?? String(JWT_SECRET_ACCESS_TOKEN)

  const token = jwt.sign(payload, newSecretKey, { expiresIn })

  return { token, expiresIn }
}

/**
 *
 * @param req
 * @returns
 */
export function extractToken(req: Request): string | null {
  const query = req.getQuery()
  const cookie = req.getCookies()
  const header: IncomingHttpHeaders = req.getHeaders()

  // extract from query
  if (query?.token) {
    console.log(logServer('Auth', 'Extract from Query'))
    return query.token
  }

  // extract from cookie
  if (cookie?.token) {
    console.log(logServer('Auth', 'Extract from Cookie'))
    return cookie?.token
  }

  // extract from header authorization
  if (header.authorization) {
    const splitAuthorize = header.authorization.split(' ')
    const allowedAuthorize = ['Bearer', 'JWT', 'Token']

    if (splitAuthorize.length === 2) {
      if (allowedAuthorize.includes(splitAuthorize[0])) {
        console.log(logServer('Auth', 'Extract from Header Authorization'))
        return splitAuthorize[1]
      }
    }
  }

  return null
}

/**
 *
 * @param token
 * @param secretKey
 * @returns
 */
export function verifyToken(token: string, secretKey?: string): DtoVerifyToken {
  try {
    if (!token) {
      return { data: null, message: 'unauthorized' }
    }

    const newSecretKey = secretKey ?? String(JWT_SECRET_ACCESS_TOKEN)

    const result = jwt.verify(token, newSecretKey)
    return { data: result, message: 'token is verify' }
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      const errType = 'jwt expired error'
      console.log(logErrServer(`${errType} :`, err.message))

      return { data: null, message: `${errType} : ${err.message}` }
    }

    if (err instanceof JsonWebTokenError) {
      const errType = 'jwt token error'
      console.log(logErrServer(`${errType} :`, err.message))

      return { data: null, message: `${errType} : ${err.message}` }
    }

    if (err instanceof NotBeforeError) {
      const errType = 'jwt not before error'
      console.log(logErrServer(`${errType} :`, err.message))

      return { data: null, message: `${errType} : ${err.message}` }
    }
  }
}
