import Redis, { type Redis as RedisClient } from 'ioredis'
import ms from 'ms'
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './env'

interface RedisOptionsProps {
  expiryMode?: string | any[]
  timeout?: string | number
}

interface RedisSetEntity {
  key: string
  data: string
  options?: RedisOptionsProps
}

const defaultTimeout = ms('1d') / 1000

class RedisProvider {
  private readonly client: RedisClient

  constructor() {
    this.client = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
    })
  }

  /**
   *
   * @param params
   * @returns
   */
  public async set(params: RedisSetEntity): Promise<string> {
    const { key, data, options } = params
    const timeout = options?.timeout ?? defaultTimeout

    const result = await this.client.setex(key, timeout, JSON.stringify(data))
    return result
  }

  /**
   *
   * @param key
   * @returns
   */
  public async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key)

    if (!data) return null

    const result = JSON.parse(data)
    return result
  }

  /**
   *
   * @param key
   */
  public async delete(key: string): Promise<void> {
    await this.client.del(key)
  }

  /**
   *
   * @param prefix
   */
  public async deleteByPrefix(prefix: string): Promise<void> {
    const keys = await this.client.keys(`${prefix}:*`)

    const pipeline = this.client.pipeline()

    keys.forEach((key) => {
      pipeline.del(key)
    })

    await pipeline.exec()
  }
}

export default RedisProvider
