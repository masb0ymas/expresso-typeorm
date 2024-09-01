import express, { Request, Response } from 'express'
import { env } from '~/config/env'
import { redisService } from '~/config/redis'
import { BASE_URL_SERVER } from '~/core/constant/baseUrl'
import HttpResponse from '~/core/modules/response/HttpResponse'
import { formatDateTime } from '~/core/utils/date'
import { __dirname, require } from '~/core/utils/file'
import { AppDataSource } from '~/database/datasource'
import { v1Routes } from './api/v1'

function versioning() {
  const node_modules = `${__dirname}/node_modules`
  const express = require(`${node_modules}/express/package.json`).version
  const typeorm = require(`${node_modules}/typeorm/package.json`).version
  const app = require(`${__dirname}/package.json`).version

  return { express: `v${express}`, typeorm: `v${typeorm}`, app: `v${app}` }
}

const route = express.Router()

route.get('/', (req: Request, res: Response) => {
  let responseData: any = {
    message: 'expresso TypeORM',
    maintaner: 'masb0ymas, <n.fajri@mail.com>',
    source: 'https://github.com/masb0ymas/expresso-typeorm',
  }

  if (env.NODE_ENV !== 'production') {
    responseData = {
      ...responseData,
      docs: `${BASE_URL_SERVER}/v1/api-docs`,
    }
  }

  const httpResponse = HttpResponse.get(responseData)
  return res.status(200).json(httpResponse)
})

route.get('/health', async (req: Request, res: Response) => {
  const startUsage = process.cpuUsage()

  const isConnectedDB = AppDataSource.isInitialized
  const connectedRedis = await redisService.ping()
  const { express, typeorm, app } = versioning()

  const status = {
    timezone: 'ID',
    database: isConnectedDB ? 'Ok' : 'Failed',
    redis: connectedRedis === 'PONG' ? 'Ok' : 'Failed',
    date: formatDateTime(new Date()),
    node: process.version,
    express,
    typeorm,
    api: app,
    platform: process.platform,
    uptime: process.uptime(),
    cpu_usage: process.cpuUsage(startUsage),
    memory: process.memoryUsage(),
  }

  const httpResponse = HttpResponse.get({
    message: 'Server Uptime',
    data: status,
  })
  return res.status(200).json(httpResponse)
})

route.use('/v1', v1Routes)

export { route as Routes }
