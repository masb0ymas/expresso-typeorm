import FetchAxios from '~/config/axios'
import { env } from '~/config/env'
import qs from 'qs'

const FetchApi = new FetchAxios(env.OPEN_STREET_MAP_URL)

export default class OpenStreetMapService {
  private readonly api = FetchApi.default

  /**
   *
   * @param address
   * @returns
   */
  public async getByAddress(address: string) {
    const queryParams = qs.stringify({ format: 'json', limit: 5, q: address })

    const response = await this.api.get(`/search?${queryParams}`)
    const data = response.data

    return data
  }

  /**
   * 
   * @param latitude 
   * @param longitude 
   * @returns 
   */
  public async getByCoordinate(latitude: string, longitude: string) {
    const queryParams = qs.stringify({
      format: 'jsonv2',
      lat: latitude,
      lon: longitude,
    })

    const response = await this.api.get(`/reverse?${queryParams}`)
    const data = response.data

    return data
  }
}