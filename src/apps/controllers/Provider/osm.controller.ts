import authorization from '@apps/middlewares/authorization'
import OpenStreetMapService from '@apps/services/Provider/osm.service'
import asyncHandler from '@core/helpers/asyncHandler'
import HttpResponse from '@core/modules/response/HttpResponse'
import route from '@routes/v1'
import { type Request, type Response } from 'express'

route.get(
  '/open-street-map/by-address',
  authorization,
  asyncHandler(async function getAddress(req: Request, res: Response) {
    const { q: address } = req.getQuery()

    const data = await OpenStreetMapService.getByAddress(address)

    const httpResponse = HttpResponse.get({ data })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/open-street-map/by-coordinate',
  authorization,
  asyncHandler(async function getCoordinate(req: Request, res: Response) {
    const { latitude, longitude } = req.getQuery()

    const data = await OpenStreetMapService.getByCoordinate(latitude, longitude)

    const httpResponse = HttpResponse.get({ data })
    res.status(200).json(httpResponse)
  })
)
