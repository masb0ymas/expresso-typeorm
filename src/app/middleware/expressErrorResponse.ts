import { NextFunction, Response } from 'express'
import _ from 'lodash'
import multer from 'multer'
import ErrorResponse from '~/core/modules/response/ErrorResponse'

interface DtoErrorResponse {
  statusCode: number
  error: string
  message: string
}

/**
 *
 * @param err - Error
 * @param statusCode - Status Code
 * @returns
 */
function generateErrorResponse(
  err: Error,
  statusCode: number
): DtoErrorResponse {
  return _.isObject(err.message)
    ? err.message
    : { statusCode, error: err.name, message: err.message }
}

/**
 *
 * @param err - Error
 * @param _req - Request
 * @param res - Response
 * @param next - NextFunction
 * @returns
 */
export default async function expressErrorResponse(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>> | undefined> {
  // catch error from multer
  if (err instanceof multer.MulterError) {
    return res.status(400).json(generateErrorResponse(err, 400))
  }

  // catch from global error
  if (err instanceof ErrorResponse.BaseResponse) {
    return res
      .status(err.statusCode)
      .json(generateErrorResponse(err, err.statusCode))
  }

  next(err)
}
