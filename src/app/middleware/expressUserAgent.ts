import { NextFunction, Request, Response } from 'express'
import { Details } from 'express-useragent'

/**
 * Express User Agent
 * @returns
 */
export default function expressUserAgent() {
  return function (req: Request, _res: Response, next: NextFunction) {
    // check is user agent
    const userAgentIs = (useragent: Details | any): string[] => {
      const r = []
      for (const i in useragent) if (useragent[i] === true) r.push(i)
      return r
    }

    const userAgentState = {
      browser: req.useragent?.browser,
      version: req.useragent?.version,
      os: req.useragent?.os,
      platform: req.useragent?.platform,
      geoIp: req.useragent?.geoIp,
      source: req.useragent?.source,
      is: userAgentIs(req.useragent),
    }

    req.setState({ userAgent: userAgentState })

    next()
  }
}
