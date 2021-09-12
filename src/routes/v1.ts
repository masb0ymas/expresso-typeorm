import Express from 'express'

const route = Express.Router()

export default route

require('@controllers/Auth/controller')
require('@controllers/Role/controller')
require('@controllers/Session/controller')
