import { APP_LANG } from '@config/env'
import { i18nConfig } from '@config/i18n'
import asyncHandler from '@core/helpers/asyncHandler'
import HttpResponse from '@core/modules/response/HttpResponse'
import route from '@routes/v1'
import { type Request, type Response } from 'express'
import { type TOptions } from 'i18next'
import AuthService from './service'

route.post(
  '/auth/sign-up',
  asyncHandler(async function signUp(req: Request, res: Response) {
    const { lang } = req.getQuery()
    const defaultLang = lang ?? APP_LANG
    const i18nOpt: string | TOptions = { lng: defaultLang }

    const formData = req.getBody()

    const data = await AuthService.signUp(formData)
    const message = i18nConfig.t('success.register', i18nOpt)

    const httpResponse = HttpResponse.get({ data, message })
    res.status(200).json(httpResponse)
  })
)
