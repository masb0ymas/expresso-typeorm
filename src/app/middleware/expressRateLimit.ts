import { NextFunction, Request, Response } from 'express'
import rateLimit, { Options, RateLimitRequestHandler } from 'express-rate-limit'
import { ms } from 'expresso-core'
import { env } from '~/config/env'

/**
 * Express Rate Limit
 * @returns
 */
export default function expressRateLimit(): RateLimitRequestHandler {
  const delay = ms(env.RATE_DELAY)

  return rateLimit({
    windowMs: delay, // 15 minutes
    max: env.RATE_LIMIT, // Limit each IP to 100 requests per `window`
    handler: (
      _req: Request,
      res: Response,
      _next: NextFunction,
      options: Options
    ) => {
      const result = {
        statusCode: options.statusCode,
        error: 'Too Many Requests',
        message: options.message,
      }

      res.status(options.statusCode).json(result)
    },
  })
}
