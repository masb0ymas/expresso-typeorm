/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-var-requires */
require('@babel/register')({ extensions: ['.js', '.ts'] })

import App from './app'

const Server = new App()

Server.run()
