import { type NextFunction, type Request, type Response } from 'express'
import { printLog } from 'expresso-core'
import { QueryFailedError } from 'typeorm'

async function expressErrorTypeORM(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>> | undefined> {
  if (err instanceof QueryFailedError) {
    const errType = 'TypeORM Error:'

    const logMessage = printLog(errType, err.message, { label: 'error' })
    console.log(logMessage)

    return res.status(400).json({
      code: 400,
      message: `${errType} ${err.message}`,
    })
  }

  next(err)
}

export default expressErrorTypeORM
