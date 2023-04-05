import authorization from '@apps/middlewares/authorization'
import SessionService from '@apps/services/session.service'
import { APP_LANG } from '@config/env'
import asyncHandler from '@core/helpers/asyncHandler'
import { type ReqOptions } from '@core/interface/ReqOptions'
import HttpResponse from '@core/modules/response/HttpResponse'
import route from '@routes/v1'
import { type Request, type Response } from 'express'

route.get(
  '/session',
  authorization,
  asyncHandler(async function findAll(req: Request, res: Response) {
    const { lang } = req.getQuery()
    const defaultLang = lang ?? APP_LANG
    const options: ReqOptions = { lang: defaultLang }

    const data = await SessionService.findAll(req)

    const httpResponse = HttpResponse.get(data, options)
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/session/:id',
  authorization,
  asyncHandler(async function findOne(req: Request, res: Response) {
    const { lang } = req.getQuery()
    const defaultLang = lang ?? APP_LANG
    const options: ReqOptions = { lang: defaultLang }

    const { id } = req.getParams()

    const data = await SessionService.findById(id, options)

    const httpResponse = HttpResponse.get({ data }, options)
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/session',
  authorization,
  asyncHandler(async function create(req: Request, res: Response) {
    const { lang } = req.getQuery()
    const defaultLang = lang ?? APP_LANG
    const options: ReqOptions = { lang: defaultLang }

    const formData = req.getBody()

    const data = await SessionService.create(formData)

    const httpResponse = HttpResponse.created({ data }, options)
    res.status(201).json(httpResponse)
  })
)

route.delete(
  '/session/:id',
  authorization,
  asyncHandler(async function forceDelete(req: Request, res: Response) {
    const { lang } = req.getQuery()
    const defaultLang = lang ?? APP_LANG
    const options: ReqOptions = { lang: defaultLang }

    const { id } = req.getParams()

    await SessionService.delete(id, options)

    const httpResponse = HttpResponse.deleted({}, options)
    res.status(200).json(httpResponse)
  })
)
