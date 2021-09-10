import redis, { ClientOpts } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env

const optionConfigs: ClientOpts = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD ?? undefined,
}

const redisClient = redis.createClient(optionConfigs)

redisClient.on('connect', function () {
  console.log('Redis client connected')
})

redisClient.on('error', function (err) {
  console.log(`Something went wrong ${err}`)
})

export default redisClient
