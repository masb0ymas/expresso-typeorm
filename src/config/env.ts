import 'dotenv/config'

// node env
export const NODE_ENV = process.env.NODE_ENV ?? 'development'

// app
export const APP_NAME = process.env.APP_NAME ?? 'expresso'
export const APP_LANG = process.env.APP_LANG ?? 'id'
export const APP_PORT = Number(process.env.APP_PORT) ?? 8000

export const AXIOS_TIMEOUT = process.env.AXIOS_TIMEOUT ?? '5m'

export const SECRET_OTP = process.env.SECRET_OTP ?? undefined
export const EXPIRED_OTP = process.env.EXPIRED_OTP ?? '5m'

// jwt access
export const JWT_SECRET_ACCESS_TOKEN =
  process.env.JWT_SECRET_ACCESS_TOKEN ?? undefined
export const JWT_ACCESS_TOKEN_EXPIRED =
  process.env.JWT_ACCESS_TOKEN_EXPIRED ?? '1d'

// url staging
export const URL_CLIENT_STAGING =
  process.env.URL_CLIENT_STAGING ?? 'https://sandbox.example.com'
export const URL_SERVER_STAGING =
  process.env.URL_SERVER_STAGING ?? 'https://api-sandbox.example.com'

// url production
export const URL_CLIENT_PRODUCTION =
  process.env.URL_CLIENT_PRODUCTION ?? 'https://example.com'
export const URL_SERVER_PRODUCTION =
  process.env.URL_SERVER_PRODUCTION ?? 'https://api.example.com'

// redis
export const REDIS_HOST = process.env.REDIS_HOST ?? '127.0.0.1'
export const REDIS_PORT = Number(process.env.REDIS_PORT) ?? 6379
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? undefined

// storage
export const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY ?? undefined
export const STORAGE_SECRET_KEY = process.env.STORAGE_SECRET_KEY ?? undefined
export const STORAGE_BUCKET_NAME = process.env.STORAGE_BUCKET_NAME ?? 'expresso'
export const STORAGE_REGION = process.env.STORAGE_REGION ?? 'ap-southeast-1'
export const STORAGE_SIGN_EXPIRED = process.env.STORAGE_SIGN_EXPIRED ?? '7d'
