import ConstRole from '@expresso/constants/ConstRole'
import asyncHandler from '@expresso/helpers/asyncHandler'
import HttpResponse from '@expresso/modules/Response/HttpResponse'
import Authorization from '@middlewares/Authorization'
import PermissionAccess from '@middlewares/PermissionAccess'
import route from '@routes/v1'
import { Request, Response } from 'express'
import UserService from './service'

route.get(
  '/user',
  Authorization,
  asyncHandler(async function findAll(req: Request, res: Response) {
    const data = await UserService.findAll(req)

    const httpResponse = HttpResponse.get(data)
    return res.status(200).json(httpResponse)
  })
)

route.get(
  '/user/:id',
  Authorization,
  asyncHandler(async function findById(req: Request, res: Response) {
    const { id } = req.getParams()
    const data = await UserService.findById(id)

    const httpResponse = HttpResponse.get({ data })
    return res.status(200).json(httpResponse)
  })
)

route.post(
  '/user',
  Authorization,
  PermissionAccess([ConstRole.ID_ADMIN]),
  asyncHandler(async function create(req: Request, res: Response) {
    const formData = req.getBody()

    const data = await UserService.create(formData)

    const httpResponse = HttpResponse.created({ data })
    return res.status(201).json(httpResponse)
  })
)

route.put(
  '/user/:id',
  Authorization,
  PermissionAccess([ConstRole.ID_ADMIN]),
  asyncHandler(async function udpate(req: Request, res: Response) {
    const { id } = req.getParams()
    const formData = req.getBody()

    const data = await UserService.update(id, formData)

    const httpResponse = HttpResponse.updated({ data })
    return res.status(200).json(httpResponse)
  })
)

route.put(
  '/user/restore/:id',
  Authorization,
  PermissionAccess([ConstRole.ID_ADMIN]),
  asyncHandler(async function restore(req: Request, res: Response) {
    const { id } = req.getParams()

    await UserService.restore(id)

    const httpResponse = HttpResponse.updated({})
    return res.status(200).json(httpResponse)
  })
)

route.delete(
  '/user/soft-delete/:id',
  Authorization,
  PermissionAccess([ConstRole.ID_ADMIN]),
  asyncHandler(async function softDelete(req: Request, res: Response) {
    const { id } = req.getParams()

    await UserService.softDelete(id)

    const httpResponse = HttpResponse.deleted({})
    return res.status(200).json(httpResponse)
  })
)

route.delete(
  '/user/force-delete/:id',
  Authorization,
  PermissionAccess([ConstRole.ID_ADMIN]),
  asyncHandler(async function forceDelete(req: Request, res: Response) {
    const { id } = req.getParams()

    await UserService.forceDelete(id)

    const httpResponse = HttpResponse.deleted({})
    return res.status(200).json(httpResponse)
  })
)
