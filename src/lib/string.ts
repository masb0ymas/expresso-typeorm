import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import { cwd } from 'node:process'

const __filename = fileURLToPath(import.meta.url)
export const require = createRequire(import.meta.url)
export const __dirname = path.join(path.dirname(__filename), '../../')
export const currentDir = cwd()
