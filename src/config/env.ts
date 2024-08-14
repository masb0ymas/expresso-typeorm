import 'dotenv/config'

import { green } from 'colorette'
import { logger, validateBoolean } from 'expresso-core'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve('.env')

if (!fs.existsSync(envPath)) {
  const envExample = green('.env.example')
  const env = green('.env')

  const message = `Copy / Duplicate ${envExample} root directory to ${env}`
  logger.error(`Missing env! - ${message}`)
  process.exit(1)
}

/**
 *
 * @param value
 * @param fallback
 * @returns
 */
function _getEnv(value: any, fallback?: any): any {
  const result = process.env[value]

  // check env value
  if ([undefined, null, ''].includes(result)) {
    // check fallback
    if (fallback) {
      return fallback
    }

    return undefined
  }

  return result
}

const app = {
  // Application
  NODE_ENV: _getEnv('NODE_ENV', 'development'),

  APP_KEY: _getEnv('APP_KEY'),
  APP_NAME: _getEnv('APP_NAME', 'expresso'),
  APP_LANG: _getEnv('APP_LANG', 'id'),
  APP_PORT: Number(_getEnv('APP_PORT', 8000)),

  // Config
  AXIOS_TIMEOUT: _getEnv('AXIOS_TIMEOUT', '5m'),
  RATE_LIMIT: Number(_getEnv('RATE_LIMIT', 100)),
  RATE_DELAY: _getEnv('RATE_DELAY', '5m'),
}

const secret = {
  // OTP
  SECRET_OTP: _getEnv('SECRET_OTP'),
  EXPIRED_OTP: _getEnv('EXPIRED_OTP', '5m'),

  // JWT
  JWT_SECRET_ACCESS_TOKEN: _getEnv('JWT_SECRET_ACCESS_TOKEN'),
  JWT_ACCESS_TOKEN_EXPIRED: _getEnv('JWT_ACCESS_TOKEN_EXPIRED', '1d'),

  JWT_SECRET_REFRESH_TOKEN: _getEnv('JWT_SECRET_REFRESH_TOKEN'),
  JWT_REFRESH_TOKEN_EXPIRED: _getEnv('JWT_REFRESH_TOKEN_EXPIRED', '30d'),
}

const baseURL = {
  // Base URL
  URL_CLIENT_STAGING: _getEnv(
    'URL_CLIENT_STAGING',
    'https://sandbox.example.com'
  ),
  URL_SERVER_STAGING: _getEnv(
    'URL_SERVER_STAGING',
    'https://api-sandbox.example.com'
  ),

  URL_CLIENT_PRODUCTION: _getEnv(
    'URL_CLIENT_PRODUCTION',
    'https://example.com'
  ),
  URL_SERVER_PRODUCTION: _getEnv(
    'URL_SERVER_PRODUCTION',
    'https://api.example.com'
  ),
}

const database = {
  TYPEORM_CONNECTION: _getEnv('TYPEORM_CONNECTION', 'postgres'),
  TYPEORM_HOST: _getEnv('TYPEORM_HOST', '127.0.0.1'),
  TYPEORM_PORT: Number(_getEnv('TYPEORM_PORT', 5432)),
  TYPEORM_DATABASE: _getEnv('TYPEORM_DATABASE', 'expresso'),
  TYPEORM_USERNAME: _getEnv('TYPEORM_USERNAME', 'postgres'),
  TYPEORM_PASSWORD: _getEnv('TYPEORM_PASSWORD', 'postgres'),
  TYPEORM_SYNCHRONIZE: validateBoolean(_getEnv('TYPEORM_SYNCHRONIZE', true)),
  TYPEORM_LOGGING: validateBoolean(_getEnv('TYPEORM_LOGGING', true)),
  TYPEORM_MIGRATIONS_RUN: validateBoolean(
    _getEnv('TYPEORM_MIGRATIONS_RUN', true)
  ),
  TYPEORM_TIMEZONE: _getEnv('TYPEORM_TIMEZONE', 'Asia/Jakarta'),
}

const mail = {
  // default smtp
  MAIL_DRIVER: _getEnv('MAIL_DRIVER', 'smtp'),
  MAIL_HOST: _getEnv('MAIL_HOST', 'smtp.mailtrap.io'),
  MAIL_PORT: Number(_getEnv('MAIL_PORT', 2525)),
  MAIL_AUTH_TYPE: _getEnv('MAIL_AUTH_TYPE'),
  MAIL_USERNAME: _getEnv('MAIL_USERNAME'),
  MAIL_PASSWORD: _getEnv('MAIL_PASSWORD'),
  MAIL_ENCRYPTION: _getEnv('MAIL_ENCRYPTION'),

  // mailgun smtp
  MAILGUN_API_KEY: _getEnv('MAILGUN_API_KEY'),
  MAILGUN_DOMAIN: _getEnv('MAILGUN_DOMAIN'),

  // google OAuth smtp
  OAUTH_CLIENT_ID: _getEnv('OAUTH_CLIENT_ID'),
  OAUTH_CLIENT_SECRET: _getEnv('OAUTH_CLIENT_SECRET'),
  OAUTH_REDIRECT_URL: _getEnv('OAUTH_REDIRECT_URL'),
  OAUTH_REFRESH_TOKEN: _getEnv('OAUTH_REFRESH_TOKEN'),
}

const redis = {
  REDIS_HOST: _getEnv('REDIS_HOST', '127.0.0.1'),
  REDIS_PORT: Number(_getEnv('REDIS_PORT', 6379)),
  REDIS_PASSWORD: _getEnv('REDIS_PASSWORD'),
}

const storage = {
  STORAGE_PROVIDER: _getEnv('STORAGE_PROVIDER', 'minio'),
  STORAGE_HOST: _getEnv('STORAGE_HOST', '127.0.0.1'),
  STORAGE_PORT: _getEnv('STORAGE_PORT', 9000),
  STORAGE_ACCESS_KEY: _getEnv('STORAGE_ACCESS_KEY'),
  STORAGE_SECRET_KEY: _getEnv('STORAGE_SECRET_KEY'),
  STORAGE_BUCKET_NAME: _getEnv('STORAGE_BUCKET_NAME', 'expresso'),
  STORAGE_REGION: _getEnv('STORAGE_REGION', 'ap-southeast-1'),
  STORAGE_SIGN_EXPIRED: _getEnv('STORAGE_SIGN_EXPIRED', '7d'),
}

const thirdParty = {
  // open street map
  OPEN_STREET_MAP_URL: _getEnv(
    'OPEN_STREET_MAP_URL',
    'https://nominatim.openstreetmap.org'
  ),
}

export const env = {
  ...app,
  ...secret,
  ...baseURL,
  ...database,
  ...mail,
  ...redis,
  ...storage,
  ...thirdParty,
}
