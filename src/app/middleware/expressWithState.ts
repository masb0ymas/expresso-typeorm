import { NextFunction, Request, Response } from 'express'
import withState from '~/core/modules/withState'

/**
 * Express With State
 * @returns
 */
export default function expressWithState() {
  return function (req: Request, _res: Response, next: NextFunction) {
    new withState(req)

    next()
  }
}
