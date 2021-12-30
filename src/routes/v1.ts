import Express from 'express'

const route = Express.Router()

export default route

// Auth
require('@controllers/Auth/controller')

// Account
require('@controllers/Role/controller')
require('@controllers/Session/controller')
require('@controllers/User/controller')
