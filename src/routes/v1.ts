/* eslint-disable @typescript-eslint/no-var-requires */
import Express from 'express'
import fs from 'fs'
import path from 'path'

const route = Express.Router()

const baseRoutes = path.resolve(`${__dirname}/../controllers`)

/**
 * Get Routes
 * @param basePath
 */
const getRoutes = (basePath: string | Buffer): void => {
  return fs.readdirSync(basePath).forEach((file) => {
    // read controller
    const getController = `${baseRoutes}/${file}/controller`

    // require controller
    require(getController)
  })
}

export default route

// Mapping Route
getRoutes(baseRoutes)
