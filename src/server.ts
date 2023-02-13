import 'module-alias/register'
import './pathAlias'

import App from './app'

const server = new App()

// Run the Express App
server.run()
