import { logErrServer, ms } from '@core/helpers/formatter'
import ResponseError from '@core/modules/response/ResponseError'
import axios, { type AxiosError, type AxiosInstance } from 'axios'
import chalk from 'chalk'
import _ from 'lodash'
import { AXIOS_TIMEOUT } from './env'
import { redisService } from './redis'

const timeout = ms(AXIOS_TIMEOUT)

/**
 * Create Axios Instance
 * @param baseURL
 * @returns
 */
function createAxios(baseURL: string): AxiosInstance {
  const axiosInstance = axios.create({ baseURL, timeout })

  // Interceptiors Request
  axiosInstance.interceptors.request.use(async (config) => {
    const currentConfig = { ...config }

    const storeToken = await redisService.get<string>('token')

    if (storeToken) {
      currentConfig.headers.Authorization = storeToken
    }

    return currentConfig
  })

  // Interceptors Response
  axiosInstance.interceptors.response.use(
    function onSuccess(response) {
      return response
    },

    async function onError(error: AxiosError) {
      const statusCode = _.get(error, 'response.status', null)
      const message = _.get(error, 'response.data.message', null)

      const errAxios = (type: string): string => chalk.red(`Axios Err: ${type}`)

      if (statusCode === 401) {
        console.log(logErrServer(errAxios('Unauhtorized'), String(message)))
        throw new ResponseError.Unauthorized(String(message))
      }

      if (statusCode === 400) {
        console.log(logErrServer(errAxios('Bad Request'), String(message)))
        throw new ResponseError.BadRequest(String(message))
      }

      if (statusCode === 404) {
        console.log(logErrServer(errAxios('Not Found'), String(message)))
        throw new ResponseError.NotFound(String(message))
      }

      const handleError = error?.response?.headers?.handleError

      if (!handleError) {
        if (error.code === 'ECONNREFUSED') {
          console.log(
            logErrServer(errAxios('Service Unavailable'), String(message))
          )
          throw new ResponseError.InternalServer('Service Unavailable')
        }

        const errMessage: any = error.response?.data ?? error.message
        console.log(errAxios(errMessage))

        throw new ResponseError.BadRequest(errMessage)
      }

      return await Promise.reject(error)
    }
  )

  return axiosInstance
}

class FetchAxios {
  private axiosInstance: AxiosInstance | null
  private readonly baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.axiosInstance = null
  }

  /**
   * Default Config Axios
   */
  public get default(): AxiosInstance {
    if (!this.axiosInstance) {
      this.axiosInstance = createAxios(this.baseURL)

      return this.axiosInstance
    }

    return this.axiosInstance
  }
}

export default FetchAxios
