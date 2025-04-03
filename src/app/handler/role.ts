import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import authorization from '../middleware/authorization'
import RoleService from '../service/role'

const route = express.Router()
const service = new RoleService()

route.get(
  '/',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, pageSize, filtered, sorted } = req.getQuery()
    const records = await service.find({ page, pageSize, filtered, sorted })
    const httpResponse = HttpResponse.get({ data: records })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/:id',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const record = await service.findById(id)
    const httpResponse = HttpResponse.get({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const values = req.getBody()
    const record = await service.create(values)
    const httpResponse = HttpResponse.created({ data: record })
    res.status(201).json(httpResponse)
  })
)

route.put(
  '/:id',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const values = req.getBody()
    const record = await service.update(id, values)
    const httpResponse = HttpResponse.updated({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.put(
  '/restore/:id',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    await service.restore(id)
    const httpResponse = HttpResponse.updated({})
    res.status(200).json(httpResponse)
  })
)

route.delete(
  '/soft-delete/:id',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    await service.softDelete(id)
    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

route.delete(
  '/force-delete/:id',
  authorization(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    await service.forceDelete(id)
    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

export { route as RoleHandler }
