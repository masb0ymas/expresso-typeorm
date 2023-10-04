import { green } from 'colorette'
import { type NextFunction, type Request, type Response } from 'express'
import { logger } from 'expresso-core'
import { QueryFailedError } from 'typeorm'

/**
 * Express Error TypeORM
 * @param err
 * @param req
 * @param res
 * @param next
 * @returns
 */
async function expressErrorTypeORM(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>> | undefined> {
  if (err instanceof QueryFailedError) {
    const msgType = green('typeorm')
    logger.error(`${msgType} - err, ${err.message ?? err}`)

    return res.status(400).json({
      code: 400,
      message: `${msgType} ${err.message}`,
    })
  }

  next(err)
}

export default expressErrorTypeORM
