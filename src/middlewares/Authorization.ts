import { logErrServer } from '@core/helpers/formatter'
import { extractToken, verifyToken } from '@core/helpers/token'
import { type NextFunction, type Request, type Response } from 'express'

async function authorization(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>> | undefined> {
  const getToken = extractToken(req)
  const token = verifyToken(String(getToken))

  if (token?.data) {
    console.log(logErrServer('Permission :', 'Unauthorized'))

    return res.status(401).json({ code: 401, message: token.message })
  }

  req.setState({ userLogin: token?.data })
  next()
}

export default authorization
