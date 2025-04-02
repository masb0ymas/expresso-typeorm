import express, { Request, Response } from 'express'
import { env } from '~/config/env'
import { asyncHandler } from '~/lib/async-handler'
import ErrorResponse from '~/lib/http/errors'
import HttpResponse from '~/lib/http/response'
import JwtToken from '~/lib/token/jwt'
import { UserLoginState } from '../database/schema/user'
import AuthService from '../service/auth'

const route = express.Router()
const service = new AuthService()

const jwt = new JwtToken({ secret: env.JWT_SECRET, expires: env.JWT_EXPIRES })

route.post(
  '/sign-up',
  asyncHandler(async (req: Request, res: Response) => {
    const values = req.getBody()
    const record = await service.register(values)
    const httpResponse = HttpResponse.created({
      data: record,
      message: 'User registered successfully',
    })
    res.status(201).json(httpResponse)
  })
)

route.post(
  '/sign-in',
  asyncHandler(async (req: Request, res: Response) => {
    const values = req.getBody()
    const data = await service.login(values)
    const httpResponse = HttpResponse.get({
      data,
      message: 'Login successfully',
    })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/verify-session',
  asyncHandler(async (req: Request, res: Response) => {
    const token = jwt.extract(req)
    const { uid: user_id } = req.getState('userLoginState') as UserLoginState

    const data = await service.verifySession({ token, user_id })
    const httpResponse = HttpResponse.get({
      data,
      message: 'Session verified successfully',
    })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/sign-out',
  asyncHandler(async (req: Request, res: Response) => {
    const formData = req.getBody()

    const token = jwt.extract(req)
    const { uid: user_id } = req.getState('userLoginState') as UserLoginState

    if (formData.user_id !== user_id) {
      throw new ErrorResponse.Forbidden('you are not allowed')
    }

    const { message } = await service.logout({ token, user_id })

    const httpResponse = HttpResponse.get({ message })
    res.status(200).json(httpResponse)
  })
)

export { route as AuthHandler }
