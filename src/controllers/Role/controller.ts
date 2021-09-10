import asyncHandler from '@expresso/helpers/asyncHandler'
import HttpResponse from '@expresso/modules/Response/HttpResponse'
import { Request, Response } from 'express'
import RoleService from './service'
import route from '@routes/v1'

route.get(
  '/role',
  asyncHandler(async function getAll(req: Request, res: Response) {
    const data = await RoleService.getAll()

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
