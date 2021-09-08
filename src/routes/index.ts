import HttpResponse from '@expresso/modules/Response/HttpResponse'
import { BASE_URL_SERVER } from 'config/BaseURL'
import Express, { Request, Response } from 'express'

const { NODE_ENV } = process.env
const route = Express.Router()

/**
 * Index Route
 */
route.get('/', function (req: Request, res: Response) {
  let responseData: any = {
    message: 'Express built in TypeORM',
    maintaner: 'masb0ymas, <n.fajri@outlook.com>',
    source: 'https://github.com/masb0ymas/expresso-typeorm',
  }

  if (NODE_ENV !== 'production') {
    responseData = {
      ...responseData,
      docs: `${BASE_URL_SERVER}/v1/api-docs`,
    }
  }

  const buildResponse = HttpResponse.get(responseData)
  return res.json(buildResponse)
})

export default route
