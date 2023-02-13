import ModuleAlias from 'module-alias'

ModuleAlias.addAliases({
  '@core': `${__dirname}/@core`,
  '@config': `${__dirname}/config`,
  '@controllers': `${__dirname}/controllers`,
  '@middlewares': `${__dirname}/middlewares`,
  '@routes': `${__dirname}/routes`,
})
