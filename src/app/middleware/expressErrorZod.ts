import { green } from 'colorette'
import { NextFunction, Request, Response } from 'express'
import { logger } from 'expresso-core'
import { z } from 'zod'

/**
 * Express Error Zod
 * @param err
 * @param req
 * @param res
 * @param next
 * @returns
 */
export default async function expressErrorZod(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>> | undefined> {
  if (err instanceof z.ZodError) {
    const msgType = green('zod')
    const message = 'validation error!'

    logger.error(`${msgType} - ${message}`)

    const errors =
      err.errors.length > 0
        ? err.errors.reduce((acc: any, curVal: any) => {
            acc[`${curVal.path}`] = curVal.message || curVal.type
            return acc
          }, {})
        : { [`${err.errors[0].path}`]: err.errors[0].message }

    console.log({ errors })

    const result = {
      statusCode: 422,
      error: 'Unprocessable Content',
      message,
      errors,
    }

    return res.status(422).json(result)
  }

  next(err)
}
