import asyncHandler from '@expresso/helpers/asyncHandler'
import HttpResponse from '@expresso/modules/Response/HttpResponse'
import { Request, Response } from 'express'
import route from '@routes/v1'
import SessionService from './service'

route.get(
  '/session',
  asyncHandler(async function getAll(req: Request, res: Response) {
    const data = await SessionService.getAll(req)

    const httpResponse = HttpResponse.get(data)
    return res.status(200).json(httpResponse)
  })
)

route.get(
  '/session/:id',
  asyncHandler(async function getOne(req: Request, res: Response) {
    const { id } = req.params
    const data = await SessionService.getOne(id)

    const httpResponse = HttpResponse.get({ data })
    return res.status(200).json(httpResponse)
  })
)

route.post(
  '/session',
  asyncHandler(async function created(req: Request, res: Response) {
    const formData = req.body

    const data = await SessionService.created(formData)

    const httpResponse = HttpResponse.created({ data })
    return res.status(201).json(httpResponse)
  })
)

route.put(
  '/session/:id',
  asyncHandler(async function created(req: Request, res: Response) {
    const { id } = req.params
    const formData = req.body

    const data = await SessionService.updated(id, formData)

    const httpResponse = HttpResponse.updated({ data })
    return res.status(200).json(httpResponse)
  })
)

route.delete(
  '/session/:id',
  asyncHandler(async function created(req: Request, res: Response) {
    const { id } = req.params

    await SessionService.deleted(id)

    const httpResponse = HttpResponse.deleted({})
    return res.status(200).json(httpResponse)
  })
)
