import asyncHandler from '@expresso/helpers/asyncHandler'
import HttpResponse from '@expresso/modules/Response/HttpResponse'
import route from '@routes/v1'
import { Request, Response } from 'express'
import UserService from './service'

route.get(
  '/user',
  asyncHandler(async function getAll(req: Request, res: Response) {
    const data = await UserService.getAll(req)

    const httpResponse = HttpResponse.get(data)
    return res.status(200).json(httpResponse)
  })
)

route.get(
  '/user/:id',
  asyncHandler(async function getOne(req: Request, res: Response) {
    const { id } = req.params
    const data = await UserService.getOne(id)

    const httpResponse = HttpResponse.get({ data })
    return res.status(200).json(httpResponse)
  })
)

route.post(
  '/user',
  asyncHandler(async function created(req: Request, res: Response) {
    const formData = req.body

    const data = await UserService.created(formData)

    const httpResponse = HttpResponse.created({ data })
    return res.status(201).json(httpResponse)
  })
)

route.put(
  '/user/:id',
  asyncHandler(async function created(req: Request, res: Response) {
    const { id } = req.params
    const formData = req.body

    const data = await UserService.updated(id, formData)

    const httpResponse = HttpResponse.updated({ data })
    return res.status(200).json(httpResponse)
  })
)

route.delete(
  '/user/:id',
  asyncHandler(async function created(req: Request, res: Response) {
    const { id } = req.params

    await UserService.deleted(id)

    const httpResponse = HttpResponse.deleted({})
    return res.status(200).json(httpResponse)
  })
)
