import { createRequire } from 'module'
import path from 'path'

/**
 * ESM not supported `require`, but you can use this for best pratice solutions
 */
export const require = createRequire(import.meta.url)

/**
 * ESM not supported `__dirname`, but you can use this for best pratice solutions
 */
export const __dirname = path.resolve()
