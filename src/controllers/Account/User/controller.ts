import ConstRole from '@expresso/constants/ConstRole'
import asyncHandler from '@expresso/helpers/asyncHandler'
import { arrayFormatter } from '@expresso/helpers/Formatter'
import HttpResponse from '@expresso/modules/Response/HttpResponse'
import Authorization from '@middlewares/Authorization'
import PermissionAccess from '@middlewares/PermissionAccess'
import route from '@routes/v1'
import { Request, Response } from 'express'
import UserService from './service'

const onlyAdmin = [ConstRole.ID_SUPER_ADMIN, ConstRole.ID_ADMIN]

route.get(
  '/user',
  Authorization,
  asyncHandler(async function findAll(req: Request, res: Response) {
    const data = await UserService.findAll(req)

    const httpResponse = HttpResponse.get(data)
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/user/:id',
  Authorization,
  asyncHandler(async function findById(req: Request, res: Response) {
    const { id } = req.getParams()
    const data = await UserService.findById(id)

    const httpResponse = HttpResponse.get({ data })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/user',
  Authorization,
  PermissionAccess(onlyAdmin),
  asyncHandler(async function create(req: Request, res: Response) {
    const formData = req.getBody()

    const data = await UserService.create(formData)

    const httpResponse = HttpResponse.created({ data })
    res.status(201).json(httpResponse)
  })
)

route.put(
  '/user/:id',
  Authorization,
  PermissionAccess(onlyAdmin),
  asyncHandler(async function udpate(req: Request, res: Response) {
    const { id } = req.getParams()
    const formData = req.getBody()

    const data = await UserService.update(id, formData)

    const httpResponse = HttpResponse.updated({ data })
    res.status(200).json(httpResponse)
  })
)

route.put(
  '/user/restore/:id',
  Authorization,
  PermissionAccess(onlyAdmin),
  asyncHandler(async function restore(req: Request, res: Response) {
    const { id } = req.getParams()

    await UserService.restore(id)

    const httpResponse = HttpResponse.updated({})
    res.status(200).json(httpResponse)
  })
)

route.delete(
  '/user/soft-delete/:id',
  Authorization,
  PermissionAccess(onlyAdmin),
  asyncHandler(async function softDelete(req: Request, res: Response) {
    const { id } = req.getParams()

    await UserService.softDelete(id)

    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

route.delete(
  '/user/force-delete/:id',
  Authorization,
  PermissionAccess(onlyAdmin),
  asyncHandler(async function forceDelete(req: Request, res: Response) {
    const { id } = req.getParams()

    await UserService.forceDelete(id)

    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/user/multiple/restore',
  Authorization,
  PermissionAccess(onlyAdmin),
  asyncHandler(async function multipleRestore(req: Request, res: Response) {
    const formData = req.getBody()
    const arrayIds = arrayFormatter(formData.ids)

    await UserService.multipleRestore(arrayIds)

    const httpResponse = HttpResponse.updated({})
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/user/multiple/soft-delete',
  Authorization,
  PermissionAccess(onlyAdmin),
  asyncHandler(async function multipleSoftDelete(req: Request, res: Response) {
    const formData = req.getBody()
    const arrayIds = arrayFormatter(formData.ids)

    await UserService.multipleSoftDelete(arrayIds)

    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/user/multiple/force-delete',
  Authorization,
  PermissionAccess(onlyAdmin),
  asyncHandler(async function multipleForceDelete(req: Request, res: Response) {
    const formData = req.getBody()
    const arrayIds = arrayFormatter(formData.ids)

    await UserService.multipleForceDelete(arrayIds)

    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)
