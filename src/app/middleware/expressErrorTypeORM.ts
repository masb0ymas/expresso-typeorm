import { green } from 'colorette'
import { NextFunction, Request, Response } from 'express'
import { logger } from 'expresso-core'
import { QueryFailedError } from 'typeorm'

/**
 * Express Error Typeorm
 * @param err
 * @param req
 * @param res
 * @param next
 * @returns
 */
export default async function expressErrorTypeorm(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>> | undefined> {
  if (err instanceof QueryFailedError) {
    const msgType = green('typeorm')
    logger.error(`${msgType} - err, ${err.message ?? err}`)

    const result = {
      statusCode: 400,
      error: 'Bad Request',
      message: `${msgType} ${err.message}`,
    }

    return res.status(400).json(result)
  }

  next(err)
}
