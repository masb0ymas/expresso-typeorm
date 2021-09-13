import asyncHandler from '@expresso/helpers/asyncHandler'
import HttpResponse from '@expresso/modules/Response/HttpResponse'
import route from '@routes/v1'
import { Request, Response } from 'express'
import RoleService from './service'

route.get(
  '/role',
  asyncHandler(async function getAll(req: Request, res: Response) {
    const data = await RoleService.getAll(req)

    const httpResponse = HttpResponse.get(data)
    return res.status(200).json(httpResponse)
  })
)

route.get(
  '/role/:id',
  asyncHandler(async function getOne(req: Request, res: Response) {
    const { id } = req.params
    const data = await RoleService.getOne(id)

    const httpResponse = HttpResponse.get({ data })
    return res.status(200).json(httpResponse)
  })
)

route.post(
  '/role',
  asyncHandler(async function created(req: Request, res: Response) {
    const formData = req.body

    const data = await RoleService.created(formData)

    const httpResponse = HttpResponse.created({ data })
    return res.status(201).json(httpResponse)
  })
)

route.put(
  '/role/:id',
  asyncHandler(async function created(req: Request, res: Response) {
    const { id } = req.params
    const formData = req.body

    const data = await RoleService.updated(id, formData)

    const httpResponse = HttpResponse.updated({ data })
    return res.status(200).json(httpResponse)
  })
)

route.delete(
  '/role/:id',
  asyncHandler(async function created(req: Request, res: Response) {
    const { id } = req.params

    await RoleService.deleted(id)

    const httpResponse = HttpResponse.deleted({})
    return res.status(200).json(httpResponse)
  })
)
