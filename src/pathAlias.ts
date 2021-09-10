import ModuleAlias from 'module-alias'

ModuleAlias.addAliases({
  '@expresso': `${__dirname}/@expresso`,
  '@config': `${__dirname}/config`,
  '@controllers': `${__dirname}/controllers`,
  '@entity': `${__dirname}/entity`,
  '@jobs': `${__dirname}/jobs`,
  '@middlewares': `${__dirname}/middlewares`,
  '@migration': `${__dirname}/migration`,
  '@routes': `${__dirname}/routes`,
  '@utils': `${__dirname}/utils`,
  '@views': `${__dirname}/views`,
})
